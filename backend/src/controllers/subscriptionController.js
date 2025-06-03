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

      // Busca el Stripe Subscription ID en tu BD
      const [rows] = await SubscriptionModel.db.execute(
        'SELECT Stripe_Subscription_ID FROM Subscriptions WHERE Subscription_ID = ? AND User_ID = ?',
        [subId, userId]
      );
      if (rows.length && rows[0].Stripe_Subscription_ID) {
        // Cancela en Stripe
        await stripe.subscriptions.update(rows[0].Stripe_Subscription_ID, { cancel_at_period_end: true });
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
      // Cancela cualquier suscripción activa anterior
      await SubscriptionModel.db.execute(
        `UPDATE Subscriptions SET Status = 'canceled' WHERE User_ID = ? AND Status = 'active'`,
        [userId]
      );
      // Crea la nueva suscripción
      const [result] = await SubscriptionModel.db.execute(
        `INSERT INTO Subscriptions (User_ID, Type, Start_Date, End_Date, Status)
         VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 ${billing === 'monthly' ? 'MONTH' : 'YEAR'}), 'active')`,
        [userId, 'premium']
      );
      const subscriptionId = result.insertId;
      // Crea la transacción (puedes ajustar el monto según tu lógica)
      const amount = billing === 'monthly' ? 9.99 : 99.99;
      await SubscriptionModel.createTransaction(
        subscriptionId,
        amount,
        'card',
        'completed'
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Error al activar suscripción' });
    }
  },
};

module.exports = SubscriptionController;