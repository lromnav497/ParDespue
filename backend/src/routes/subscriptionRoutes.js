const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const SubscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

// Obtener el plan actual del usuario
router.get('/my-plan', authMiddleware, (req, res, next) => {
  console.log('Entrando a /api/subscriptions/my-plan');
  next();
}, SubscriptionController.getUserPlan);

// Cambiar de plan (simulado)
router.post('/change-plan', authMiddleware, SubscriptionController.setUserPlan);

// Saber si puede crear cápsula (para frontend)
router.get('/can-create-capsule', authMiddleware, SubscriptionController.canCreateCapsule);

// NUEVA RUTA: Devuelve suscripciones y transacciones del usuario
router.get('/my-data', authMiddleware, SubscriptionController.getUserData);

module.exports = router;