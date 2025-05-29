const db = require('../config/db');

const SubscriptionModel = {
  db, // Exporta la conexión para usarla en el controlador

  // Obtiene la suscripción activa del usuario
  getUserPlan: async (userId) => {
    const [rows] = await db.execute(
      `SELECT Type as plan FROM Subscriptions WHERE User_ID = ? AND Status = 'active' ORDER BY End_Date DESC LIMIT 1`,
      [userId]
    );
    const planDb = rows[0]?.plan || 'basic';
    if (planDb === 'premium') return 'Premium';
    if (planDb === 'basic') return 'Básico';
    return planDb.charAt(0).toUpperCase() + planDb.slice(1);
  },

  // Cambia el plan del usuario
  setUserPlan: async (userId, plan) => {
    const planDb = plan.toLowerCase();

    await db.execute(`UPDATE Subscriptions SET Status = 'inactive' WHERE User_ID = ?`, [userId]);
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
        'completed',
        'Compra de suscripción'
      );
    }

    // Devuelve el mismo formato que getUserPlan
    if (planDb === 'premium') return { plan: 'Premium' };
    if (planDb === 'basic') return { plan: 'Básico' };
    return { plan: planDb.charAt(0).toUpperCase() + planDb.slice(1) };
  },

  // Cuenta cápsulas del usuario
  countUserCapsules: async (userId) => {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total FROM Capsules WHERE Creator_User_ID = ?`,
      [userId]
    );
    return rows[0]?.total || 0;
  },

  // Crea una transacción asociada a una suscripción
  createTransaction: async (subscriptionId, amount, paymentMethod = 'card', status = 'completed', description = null) => {
    await db.execute(
      `INSERT INTO Transactions (Subscription_ID, Date, Amount, Payment_Method, Status, Description)
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [subscriptionId, amount, paymentMethod, status, description]
    );
  },

  async cancel(subId, userId) {
    await db.query(
      'UPDATE Subscriptions SET Status = ? WHERE Subscription_ID = ? AND User_ID = ?',
      ['canceled', subId, userId]
    );
    // No crear transacción aquí
  },

  async renew(subId, months, userId) {
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
    await SubscriptionModel.createTransaction(
      subId,
      amount,
      'card',
      'completed',
      'Renovación de suscripción'
    );
  },

  async getActiveSubscriptions(userId) {
    const [subs] = await SubscriptionModel.db.execute(
      `SELECT Subscription_ID as id, Type as nombre, End_Date as fecha_fin, Status as status
       FROM Subscriptions WHERE User_ID = ? AND Status = 'active' ORDER BY End_Date DESC`, [userId]
    );
    return subs;
  }
};

module.exports = SubscriptionModel;