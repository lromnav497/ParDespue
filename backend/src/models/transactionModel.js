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

    createTransaction = async (subscriptionId, amount, paymentMethod = 'card', status = 'completed', description = null) => {
        await db.execute(
            `INSERT INTO Transactions (Subscription_ID, Date, Amount, Payment_Method, Status, Description)
             VALUES (?, NOW(), ?, ?, ?, ?)`,
            [subscriptionId, amount, paymentMethod, status, description]
        );
    }
}

module.exports = new TransactionModel();