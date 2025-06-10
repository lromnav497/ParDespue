const SubscriptionModel = require('../models/subscriptionModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const UserModel = require('../models/userModel'); // Asegúrate de tener el modelo de usuario importado

const SubscriptionController = {
  getUserPlan: async (req, res) => {
    try {
      const userId = req.user.id;
      const suscripcion = await SubscriptionModel.getUserPlan(userId);
      res.json({ suscripcion });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  setUserPlan: async (req, res) => {
    try {
      const userId = req.user.id;
      const { plan } = req.body;
      const result = await SubscriptionModel.setUserPlan(userId, plan);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message || 'Error al cambiar de plan' });
    }
  },

  canCreateCapsule: async (req, res) => {
    try {
      const userId = req.user.id;
      const plan = await SubscriptionModel.getUserPlan(userId);
      const total = await SubscriptionModel.countUserCapsules(userId);
      if (plan === 'Básico' && total >= 15) {
        return res.json({ allowed: false, message: 'Límite de cápsulas alcanzado para el plan Básico.' });
      }
      res.json({ allowed: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Cambiado: ahora usa métodos del modelo para obtener datos
  getUserData: async (req, res) => {
    try {
      const userId = req.user.id;
      // Obtiene suscripciones y transacciones desde el modelo
      const subs = await SubscriptionModel.getUserSubscriptions(userId);
      const txs = await SubscriptionModel.getUserTransactions(userId);
      res.json({
        suscripciones: subs,
        transacciones: txs
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  renewSubscription: async (req, res) => {
    try {
      const userId = req.user.id;
      const subId = req.params.id;
      const { months } = req.body;
      if (!months || isNaN(months)) {
        return res.status(400).json({ message: 'Faltan los meses de renovación.' });
      }

      // Solo renueva en la BD, sin Stripe
      await SubscriptionModel.renew(subId, userId, months);

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Error al renovar suscripción' });
    }
  },

  cancelSubscription: async (req, res) => {
    try {
      const userId = req.user.id;
      const subId = req.params.id;

      // Busca el Stripe Subscription ID en el modelo
      const stripeSubId = await SubscriptionModel.getStripeSubscriptionId(subId, userId);
      if (stripeSubId) {
        // Cancela en Stripe
        await stripe.subscriptions.update(stripeSubId, { cancel_at_period_end: true });
      }

      // Cancela en tu BD
      await SubscriptionModel.cancel(subId, userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Error al cancelar suscripción' });
    }
  },

  activatePremium: async (req, res) => {
    try {
      const userId = req.user.id;
      const { billing } = req.body; // 'monthly' o 'annual'
      // Lógica de activación delegada al modelo
      await SubscriptionModel.activatePremium(userId, billing);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Error al activar suscripción' });
    }
  },
};

module.exports = SubscriptionController;