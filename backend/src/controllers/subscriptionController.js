const SubscriptionModel = require('../models/subscriptionModel');

const SubscriptionController = {
  getUserPlan: async (req, res) => {
    try {
      console.log('userId recibido:', req.user.id); // <-- Agrega esto
      const userId = req.user.id;
      const plan = await SubscriptionModel.getUserPlan(userId);
      console.log('plan encontrado:', plan); // <-- Y esto
      res.json({ plan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  setUserPlan: async (req, res) => {
    try {
      const userId = req.user.id;
      const { plan } = req.body;
      const validPlans = ['basic', 'premium'];
      if (!validPlans.includes(plan.toLowerCase())) {
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
  },

  getUserData: async (req, res) => {
    try {
      const userId = req.user.id;
      // Suscripciones activas
      const [subs] = await SubscriptionModel.db.execute(
        `SELECT Subscription_ID as id, Type as nombre, End_Date as fecha_fin
         FROM Subscriptions WHERE User_ID = ? ORDER BY End_Date DESC`, [userId]
      );
      // Transacciones
      const [txs] = await SubscriptionModel.db.execute(
        `SELECT t.Transaction_ID as id, t.Date as fecha, t.Amount as monto, t.Status as estado, s.Type as descripcion
         FROM Transactions t
         JOIN Subscriptions s ON t.Subscription_ID = s.Subscription_ID
         WHERE s.User_ID = ? ORDER BY t.Date DESC`, [userId]
      );
      res.json({
        suscripciones: subs,
        transacciones: txs
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = SubscriptionController;