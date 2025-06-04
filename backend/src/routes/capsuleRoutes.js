const express = require('express');
const router = express.Router();
const CapsuleController = require('../controllers/capsuleController');
const capsuleModel = require('../models/capsuleModel');
const db = require('../config/db');
const requirePremium = require('../middleware/premiumMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
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
  async (req, res) => {
    try {
      const {
        Title, Description, Creation_Date, Opening_Date,
        Privacy, Tags, Creator_User_ID, Password, Category_ID, notificaciones
      } = req.body;
      let coverImageUrl = null;
      if (req.file) {
        coverImageUrl = `/uploads/capsule_covers/${req.file.filename}`;
      }
      // Crea la cápsula con la portada
      const result = await capsuleModel.create({
        Title,
        Description,
        Creation_Date,
        Opening_Date,
        Privacy,
        Tags,
        Creator_User_ID,
        Password,
        Category_ID,
        Cover_Image: coverImageUrl,
        notificaciones
      });
      // RESPONDE CON EL OBJETO COMPLETO QUE YA INCLUYE Capsule_ID
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
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
// Obtener cápsula por ID con todos los campos y contenidos
router.get('/:id', async (req, res) => {
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
router.put('/:id', authMiddleware, (req, res) => CapsuleController.update(req, res));
router.delete('/:id', async (req, res) => {
  const capsuleId = req.params.id;
  const userId = req.body.userId || req.headers['x-user-id'];

  try {
    // Usa el método del modelo, que ya elimina todo correctamente
    await capsuleModel.delete(capsuleId);
    res.json({ message: 'Cápsula eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la cápsula', error: err.message });
  }
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
    if (!req.file) return res.status(400).json({ message: 'No se subió ninguna imagen' });
    const coverUrl = `/uploads/capsule_covers/${req.file.filename}`;
    await capsuleModel.update(req.params.id, { Cover_Image: coverUrl });
    res.json({ message: 'Portada actualizada', coverImage: coverUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Método nuevo para obtener cápsulas públicas paginadas
router.get('/public-paginated', async (req, res) => {
  console.log('[ROUTE] /public-paginated', req.query);
  const { page = 1, pageSize = 10, category, search } = req.query;
  try {
    const capsules = await capsuleModel.findPublicPaginated({
      page: Number(page),
      pageSize: Number(pageSize),
      category,
      search
    });
    console.log('[ROUTE] /public-paginated response:', capsules);
    res.json(capsules);
  } catch (error) {
    console.error('[ROUTE] /public-paginated ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;