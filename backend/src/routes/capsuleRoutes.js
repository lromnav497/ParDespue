const express = require('express');
const router = express.Router();
const CapsuleController = require('../controllers/capsuleController');
const capsuleModel = require('../models/capsuleModel');
const db = require('../config/db');
const requirePremium = require('../middleware/premiumMiddleware');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para portada
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/capsule_covers/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadCover = multer({ storage: coverStorage });

// Crear cápsula con portada
router.post(
  '/',
  authMiddleware,
  uploadCover.single('cover_image'),
  (req, res) => {
    // Si hay portada, agrega la ruta al body para el controller
    if (req.file) {
      req.body.Cover_Image = `/uploads/capsule_covers/${req.file.filename}`;
    }
    // Convierte notificaciones a booleano real
    if (typeof req.body.notificaciones === 'string') {
      req.body.notificaciones = req.body.notificaciones === 'true';
    }
    CapsuleController.create(req, res);
  }
);
router.get('/privacy/:privacy', async (req, res) => {
    try {
        const capsules = await capsuleModel.findByPrivacy(req.params.privacy);
        res.status(200).json(capsules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/user/:userId', (req, res) => CapsuleController.findByUser(req, res));
router.get('/public', (req, res) => CapsuleController.getPublicCapsules(req, res));

// ¡ESTA RUTA DEBE IR ANTES!
router.get('/all', authMiddleware, roleMiddleware('administrator'), async (req, res) => {
  try {
    console.log('[LOG] GET /api/capsules/all called');
    const capsules = await capsuleModel.findAll();
    console.log('[LOG] Capsules found:', capsules.length);
    res.json(capsules);
  } catch (error) {
    console.error('[ERROR] /api/capsules/all:', error);
    res.status(500).json({ message: 'Error al obtener las cápsulas' });
  }
});

// Obtener cápsula por ID con todos los campos y contenidos
router.get('/:id', authMiddleware, async (req, res) => {
  const capsuleId = req.params.id;
  const user = req.user || {};
  const userId = user.id;
  const userRole = user.role;

  const capsule = await capsuleModel.findById(capsuleId);
  if (!capsule) return res.status(404).json({ message: 'Cápsula no encontrada' });

  // Permitir si es el creador o admin
  if (userId === capsule.Creator_User_ID || userRole === 'administrator') return res.json(capsule);

  // Permitir si es Reader o Collaborator en Recipients
  const [rows] = await db.execute(
    `SELECT Role_ID FROM Recipients WHERE Capsule_ID = ? AND User_ID = ?`,
    [capsuleId, userId]
  );
  if (rows.length > 0 && (rows[0].Role_ID == 2 || rows[0].Role_ID == 3)) {
    // 2 = Reader, 3 = Collaborator
    return res.json(capsule);
  }

  // Si no cumple ninguna condición, denegar
  return res.status(403).json({ message: 'No tienes acceso a esta cápsula.' });
});

// Para editar la cápsula (permite premium, dueño o administrador)
router.get('/:id/edit', authMiddleware, async (req, res) => {
  const capsuleId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  const capsule = await capsuleModel.findById(capsuleId);
  if (!capsule) return res.status(404).json({ message: 'Cápsula no encontrada' });

  // Permitir si es el creador o admin
  if (userId === capsule.Creator_User_ID || userRole === 'administrator') return res.json(capsule);

  // Permitir si es Collaborator en Recipients Y tiene premium
  const [rows] = await db.execute(
    `SELECT r.Role_ID, s.Type as Plan
     FROM Recipients r
     LEFT JOIN Subscriptions s ON r.User_ID = s.User_ID AND s.Status = 'active'
     WHERE r.Capsule_ID = ? AND r.User_ID = ?`,
    [capsuleId, userId]
  );
  if (rows.length > 0 && rows[0].Role_ID == 3 && rows[0].Plan === 'premium') {
    return res.json(capsule);
  }

  return res.status(403).json({ message: 'Solo los colaboradores premium pueden editar esta cápsula.' });
});

router.put('/:id', authMiddleware, async (req, res) => {
  const capsuleId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  const capsule = await capsuleModel.findById(capsuleId);
  if (!capsule) return res.status(404).json({ message: 'Cápsula no encontrada' });

  // Permitir si es el creador o admin
  if (userId === capsule.Creator_User_ID || userRole === 'administrator') return CapsuleController.update(req, res);

  // Permitir si es Collaborator en Recipients Y tiene premium
  const [rows] = await db.execute(
    `SELECT r.Role_ID, s.Type as Plan
     FROM Recipients r
     LEFT JOIN Subscriptions s ON r.User_ID = s.User_ID AND s.Status = 'active'
     WHERE r.Capsule_ID = ? AND r.User_ID = ?`,
    [capsuleId, userId]
  );
  if (rows.length > 0 && rows[0].Role_ID == 3 && rows[0].Plan === 'premium') {
    return CapsuleController.update(req, res);
  }

  return res.status(403).json({ message: 'Solo los colaboradores premium pueden editar esta cápsula.' });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const capsuleId = req.params.id;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'administrator';

  // Busca la cápsula
  const capsule = await capsuleModel.findById(capsuleId);
  if (!capsule) return res.status(404).json({ message: 'Cápsula no encontrada' });

  // Solo dueño, premium o admin pueden eliminar
  if (capsule.Creator_User_ID !== userId && !isAdmin) {
    return res.status(403).json({ message: 'No tienes permiso para eliminar esta cápsula.' });
  }

  await capsuleModel.delete(capsuleId);
  res.json({ message: 'Cápsula eliminada correctamente.' });
});
router.post('/:id/check-password', async (req, res) => {
  const { password } = req.body;
  const capsuleId = req.params.id;
  const [rows] = await db.query('SELECT Password FROM Capsules WHERE Capsule_ID = ?', [capsuleId]);
  if (!rows.length) return res.status(404).json({ valid: false });
  const valid = rows[0].Password === password;
  res.json({ valid });
});

// Subir/actualizar portada
router.put('/:id/cover', authMiddleware, uploadCover.single('cover_image'), async (req, res) => {
  try {
    // Si se pide eliminar la portada
    if (req.body.remove === 'true' || req.body.remove === true) {
      // Busca la cápsula para saber la imagen actual
      const [rows] = await db.query('SELECT Cover_Image FROM Capsules WHERE Capsule_ID = ?', [req.params.id]);
      const coverPath = rows[0]?.Cover_Image;
      if (coverPath) {
        const fs = require('fs');
        const path = require('path');
        const fullPath = path.join(__dirname, '..', '..', coverPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
      await capsuleModel.update(req.params.id, { Cover_Image: null });
      return res.json({ message: 'Portada eliminada', coverImage: null });
    }

    // Si se sube una nueva imagen
    if (!req.file) return res.status(400).json({ message: 'No se subió ninguna imagen' });
    const coverUrl = `/uploads/capsule_covers/${req.file.filename}`;
    await capsuleModel.update(req.params.id, { Cover_Image: coverUrl });
    res.json({ message: 'Portada actualizada', coverImage: coverUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/:id/view', async (req, res) => CapsuleController.addView(req, res));
router.post('/:id/like', authMiddleware, async (req, res) => CapsuleController.addLike(req, res));
router.delete('/:id/like', authMiddleware, async (req, res) => CapsuleController.removeLike(req, res));
router.get('/:id/liked', authMiddleware, async (req, res) => CapsuleController.userLiked(req, res));


module.exports = router;