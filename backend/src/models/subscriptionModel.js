const db = require('../config/db');

const SubscriptionModel = {
  db, // Exporta la conexión para usarla en el controlador

  // Obtiene la suscripción activa del usuario
  getUserPlan: async (userId) => {
    const [rows] = await db.execute(
      `SELECT Type as plan FROM Subscriptions WHERE User_ID = ? AND Status = 'active' ORDER BY End_Date DESC LIMIT 1`,
      [userId]
    );
    // Convierte a formato amigable para el frontend
    const planDb = rows[0]?.plan || 'basic';
    if (planDb === 'premium') return 'Premium';
    return 'Básico';
  },

  // Cambia el plan del usuario (simulado)
  setUserPlan: async (userId, plan) => {
    // Convierte el plan a minúsculas para que coincida con el ENUM de la base de datos
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
      await SubscriptionModel.createTransaction(subscriptionId, amount);
    }

    return { plan: planDb };
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
  createTransaction: async (subscriptionId, amount) => {
    await db.execute(
      `INSERT INTO Transactions (Subscription_ID, Date, Amount, Payment_Method, Status)
       VALUES (?, NOW(), ?, 'card', 'completed')`,
      [subscriptionId, amount]
    );
  }
};

module.exports = SubscriptionModel;