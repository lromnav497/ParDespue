const SubscriptionModel = require('../models/subscriptionModel');

const SubscriptionController = {
  getUserPlan: async (req, res) => {
    try {
      const userId = req.user.id;
      const plan = await SubscriptionModel.getUserPlan(userId);
      res.json({ plan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  setUserPlan: async (req, res) => {
    try {
      const userId = req.user.id;
      const { plan } = req.body;
      if (!['Básico', 'Premium'].includes(plan)) {
        return res.status(400).json({ message: 'Plan no válido' });
      }
      await SubscriptionModel.setUserPlan(userId, plan);
      res.json({ message: `Plan cambiado a ${plan}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
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
  }
};

module.exports = SubscriptionController;