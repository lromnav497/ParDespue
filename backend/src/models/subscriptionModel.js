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
  renew: async (subId, userId, months) => {
    // Suma los meses a la fecha de fin actual
    await db.execute(
      `UPDATE Subscriptions 
       SET End_Date = DATE_ADD(End_Date, INTERVAL ? MONTH)
       WHERE Subscription_ID = ? AND User_ID = ? AND Status = 'active'`,
      [months, subId, userId]
    );
    // Obtiene el tipo de suscripción para calcular el monto
    const [rows] = await db.execute(
      'SELECT Type FROM Subscriptions WHERE Subscription_ID = ?',
      [subId]
    );
    let amount = 0;
    if (rows.length && rows[0].Type === 'premium') amount = 99.99 * (months / 12);
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
    await db.execute(
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

  getUserPlan: async (userId) => {
    const [rows] = await db.execute(
      `SELECT Subscription_ID as id, Type as nombre, End_Date as fecha_fin, Status as status
       FROM Subscriptions WHERE User_ID = ? AND Status = 'active' ORDER BY End_Date DESC LIMIT 1`,
      [userId]
    );
    if (rows.length > 0) {
      return rows[0]; // Devuelve toda la suscripción activa
    }
    return null;
  },

  db
};

module.exports = SubscriptionModel;