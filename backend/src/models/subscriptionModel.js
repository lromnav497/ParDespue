const GeneralModel = require('./generalModel');
const db = require('../config/db'); // <-- Corrección aquí
const transactionModel = require('./transactionModel');

class SubscriptionModel extends GeneralModel {
    constructor() {
        super('Subscriptions');
    }

    async getUserSubscriptionsAndTransactions(userId) {
        const [suscripciones] = await db.execute(
            `SELECT 
                Subscription_ID as id,
                Type as nombre,
                DATE_FORMAT(End_Date, '%Y-%m-%d') as fecha_fin,
                Status as estado
            FROM Subscriptions
            WHERE User_ID = ?`,
            [userId]
        );

        const transacciones = await transactionModel.getUserTransactions(userId);

        return { suscripciones, transacciones };
    }
}

module.exports = new SubscriptionModel();