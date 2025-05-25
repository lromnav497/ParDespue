const GeneralModel = require('./generalModel');
const db = require('../config/db');

class TransactionModel extends GeneralModel {
    constructor() {
        super('Transactions'); // Nombre de la tabla
    }

    async getUserTransactions(userId) {
        const [transacciones] = await db.execute(
            `SELECT 
                t.Transaction_ID as id,
                DATE_FORMAT(t.Date, '%Y-%m-%d') as fecha,
                CONCAT('Pago ', s.Type) as descripcion,
                t.Amount as monto,
                t.Status as estado
            FROM Transactions t
            INNER JOIN Subscriptions s ON t.Subscription_ID = s.Subscription_ID
            WHERE s.User_ID = ?`,
            [userId]
        );
        return transacciones;
    }
}

module.exports = new TransactionModel();