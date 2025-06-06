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
router.get('/:id', async (req, res) => {
  console.log('[LOG] GET /api/capsules/:id called with id:', req.params.id);
  const capsuleId = req.params.id;
  const userId = req.headers['x-user-id'];
  try {
    const capsule = await capsuleModel.findById(capsuleId);
    if (!capsule) return res.status(404).json({ message: 'Cápsula no encontrada' });

    const ahora = new Date();
    const apertura = new Date(capsule.Opening_Date);
    // Solo permite ver si ya se abrió
    if (apertura > ahora) {
      return res.status(403).json({ message: 'Esta cápsula aún no está disponible.' });
    }

    // Puedes devolver la info que quieras mostrar al público aquí
    res.status(200).json(capsule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Para editar la cápsula (permite premium o dueño)
router.get('/:id/edit', authMiddleware, requirePremium, async (req, res) => {
  const capsuleId = req.params.id;
  const userId = req.user.id;
  try {
    const capsule = await capsuleModel.findById(capsuleId);
    if (!capsule) return res.status(404).json({ message: 'Cápsula no encontrada' });

    // Permitir si es el dueño o si es premium
    const plan = req.user.plan || req.user.Plan || req.user.tipoPlan;
    const isPremium = plan && plan.toLowerCase() === 'premium';
    if (Number(userId) !== capsule.Creator_User_ID && !isPremium) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta cápsula.' });
    }

    // NO permitir editar si la cápsula ya está abierta
    const ahora = new Date();
    const apertura = new Date(capsule.Opening_Date);
    if (apertura <= ahora) {
      return res.status(403).json({ message: 'No se puede editar una cápsula que ya está abierta.' });
    }

    res.status(200).json(capsule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', authMiddleware, async (req, res) => {
  const capsuleId = req.params.id;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'administrator';

  // Busca la cápsula
  const capsule = await capsuleModel.findById(capsuleId);
  if (!capsule) return res.status(404).json({ message: 'Cápsula no encontrada' });

  // Solo dueño, premium o admin pueden editar
  if (capsule.Creator_User_ID !== userId && !isAdmin) {
    return res.status(403).json({ message: 'No tienes permiso para editar esta cápsula.' });
  }

  // ...actualiza la cápsula...
  CapsuleController.update(req, res);
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
// ¡Pon esto ANTES de cualquier ruta con /:id!


module.exports = router;