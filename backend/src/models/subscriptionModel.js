const db = require('../config/db');

const SubscriptionModel = {
  // Cambia de plan y crea transacción si es premium
  setUserPlan: async (userId, plan) => {
    const planDb = plan.toLowerCase();
    await db.execute(`UPDATE Subscriptions SET Status = 'canceled' WHERE User_ID = ? AND Status = 'active'`, [userId]);
    const [result] = await db.execute(
      `INSERT INTO Subscriptions (User_ID, Type, Start_Date, End_Date, Status)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'active')`,
      [userId, planDb]
    );
    const subscriptionId = result.insertId;
    let amount = 0;
    if (planDb === 'premium') amount = 99.99;
    if (amount > 0) {
      await SubscriptionModel.createTransaction(
        subscriptionId,
        amount,
        'card',
        'completed'
      );
    }
    if (planDb === 'premium') return { plan: 'Premium' };
    if (planDb === 'basic') return { plan: 'Básico' };
    return { plan: planDb.charAt(0).toUpperCase() + planDb.slice(1) };
  },

  // Renovar suscripción y crear transacción
  renew: async (subId, months, userId) => {
    await db.query(
      `UPDATE Subscriptions 
       SET End_Date = DATE_ADD(End_Date, INTERVAL ? MONTH)
       WHERE Subscription_ID = ? AND User_ID = ? AND Status = 'active'`,
      [months, subId, userId]
    );
    const [rows] = await db.execute(
      'SELECT Type FROM Subscriptions WHERE Subscription_ID = ?',
      [subId]
    );
    let amount = 0;
    if (rows.length && rows[0].Type === 'premium') amount = 99.99 * months;
    if (amount > 0) {
      await SubscriptionModel.createTransaction(
        subId,
        amount,
        'card',
        'completed'
      );
    }
  },

  // Cancelar suscripción (NO crea transacción)
  cancel: async (subId, userId) => {
    await db.query(
      'UPDATE Subscriptions SET Status = ? WHERE Subscription_ID = ? AND User_ID = ?',
      ['canceled', subId, userId]
    );
  },

  // Crear transacción (solo los campos de la tabla)
  createTransaction: async (subscriptionId, amount, paymentMethod = 'card', status = 'completed') => {
    await db.execute(
      `INSERT INTO Transactions (Subscription_ID, Date, Amount, Payment_Method, Status)
       VALUES (?, NOW(), ?, ?, ?)`,
      [subscriptionId, amount, paymentMethod, status]
    );
  },

  db
};

module.exports = SubscriptionModel;