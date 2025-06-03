const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const SubscriptionController = require('../controllers/subscriptionController');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

// Renovar suscripción
router.post('/renew/:id', authMiddleware, SubscriptionController.renewSubscription);

// Cancelar suscripción
router.post('/cancel/:id', authMiddleware, SubscriptionController.cancelSubscription);

// Crear sesión de checkout de Stripe
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { plan, billing } = req.body;
  // Define los precios de tus productos según el plan y billing
  const priceId = (plan === 'Premium' && billing === 'monthly')
    ? process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID
    : process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/suscripciones?success=1`,
      cancel_url: `${process.env.FRONTEND_URL}/suscripciones?canceled=1`,
      customer_email: req.user.email, // si usas autenticación
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NUEVA RUTA: Obtener precios de Stripe
router.get('/stripe-prices', async (req, res) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 10
    });
    res.json(prices.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NUEVA RUTA: Activar plan premium
router.post('/activate-premium', authMiddleware, SubscriptionController.activatePremium);

module.exports = router;