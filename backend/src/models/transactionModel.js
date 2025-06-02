const db = require('../config/db');

const TransactionModel = {
  getUserTransactions: async (userId) => {
    const [transacciones] = await db.execute(
      `SELECT 
          t.Transaction_ID as id,
          DATE_FORMAT(t.Date, '%Y-%m-%d') as fecha,
          CONCAT('Pago ', s.Type) as descripcion,
          t.Amount as monto,
          t.Status as estado
        FROM Transactions t
        INNER JOIN Subscriptions s ON t.Subscription_ID = s.Subscription_ID
        WHERE s.User_ID = ?
        ORDER BY t.Date DESC`,
      [userId]
    );
    return transacciones;
  }
};

module.exports = TransactionModel;