const express = require('express');
const router = express.Router();
const CapsuleController = require('../controllers/capsuleController');
const capsuleModel = require('../models/capsuleModel');
const db = require('../config/db');
const requirePremium = require('../middleware/premiumMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', (req, res) => CapsuleController.create(req, res));
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
router.put('/:id', (req, res) => CapsuleController.update(req, res));
router.delete('/:id', async (req, res) => {
  const capsuleId = req.params.id;
  const userId = req.body.userId || req.headers['x-user-id'];

  // Verifica que el usuario es el dueño (como ya tienes)

  try {
    // 1. Elimina los contenidos asociados
    await db.query('DELETE FROM Contents WHERE Capsule_ID = ?', [capsuleId]);
    // 2. Ahora elimina la cápsula
    await db.query('DELETE FROM Capsules WHERE Capsule_ID = ?', [capsuleId]);
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

module.exports = router;