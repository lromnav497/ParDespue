const db = require('../config/db');

const SubscriptionModel = {
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
    // Marca todas las suscripciones como inactivas
    await db.execute(`UPDATE Subscriptions SET Status = 'inactive' WHERE User_ID = ?`, [userId]);
    // Crea una nueva suscripción activa
    await db.execute(
      `INSERT INTO Subscriptions (User_ID, Type, Start_Date, End_Date, Status)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'active')`,
      [userId, plan]
    );
    return { plan };
  },

  // Cuenta cápsulas del usuario
  countUserCapsules: async (userId) => {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total FROM Capsules WHERE Creator_User_ID = ?`,
      [userId]
    );
    return rows[0]?.total || 0;
  }
};

module.exports = SubscriptionModel;