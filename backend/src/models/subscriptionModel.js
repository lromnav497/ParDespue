const db = require('../config/db');

const SubscriptionModel = {
  db, // Exporta la conexión para usarla en el controlador

  // Obtiene la suscripción activa del usuario
  getUserPlan: async (userId) => {
    const [rows] = await db.execute(
      `SELECT Type as plan FROM Subscriptions WHERE User_ID = ? AND Status = 'active' ORDER BY End_Date DESC LIMIT 1`,
      [userId]
    );
    return rows[0]?.plan || 'Básico';
  },

  // Cambia el plan del usuario (simulado)
  setUserPlan: async (userId, plan) => {
    await db.execute(`UPDATE Subscriptions SET Status = 'inactive' WHERE User_ID = ?`, [userId]);
    // Crea la nueva suscripción y obtiene su ID
    const [result] = await db.execute(
      `INSERT INTO Subscriptions (User_ID, Type, Start_Date, End_Date, Status)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'active')`,
      [userId, plan]
    );
    const subscriptionId = result.insertId;

    // Define el monto según el plan
    let amount = 0;
    if (plan === 'Premium') amount = 99.99; // O el precio real de tu plan
    // Si quieres distinguir mensual/anual, pásalo desde el frontend

    // Solo registra transacción si es de pago
    if (amount > 0) {
      await SubscriptionModel.createTransaction(subscriptionId, amount);
    }

    return { plan };
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