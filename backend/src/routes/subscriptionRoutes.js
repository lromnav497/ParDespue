const express = require('express');
const createGeneralRouter = require('./generalRoutes');
const { authMiddleware } = require('../middleware/authMiddleware');
const subscriptionModel = require('../models/subscriptionModel');

const router = express.Router();

// Endpoint personalizado: suscripciones y transacciones del usuario
router.get('/user/:id', authMiddleware, async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        const { id, role } = req.user;
        if (id !== userId && role !== 'administrator') {
            return res.status(403).json({ message: 'No autorizado' });
        }
        const data = await subscriptionModel.getUserSubscriptionsAndTransactions(userId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos', error: error.message });
    }
});

// CRUD general de suscripciones
router.use('/', createGeneralRouter('Subscriptions'));

// Renueva una suscripción
router.post('/renew/:id', authMiddleware, async (req, res) => {
    try {
        const subscriptionId = parseInt(req.params.id, 10);
        const months = parseInt(req.body.months, 10) || 1;

        const db = require('../config/db');
        const [subsArr] = await db.execute(
            'SELECT * FROM Subscriptions WHERE Subscription_ID = ?', [subscriptionId]
        );
        const subscription = subsArr[0];
        if (!subscription) return res.status(404).json({ message: 'Suscripción no encontrada' });

        if (req.user.id !== subscription.User_ID && req.user.role !== 'administrator') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Nueva fecha de inicio y fin
        const newStart = new Date(subscription.End_Date) > new Date() ? new Date(subscription.End_Date) : new Date();
        const newEnd = new Date(newStart);
        newEnd.setMonth(newEnd.getMonth() + months);

        await db.execute(
            'UPDATE Subscriptions SET Start_Date = ?, End_Date = ?, Status = ? WHERE Subscription_ID = ?',
            [
                newStart.toISOString().slice(0, 19).replace('T', ' '),
                newEnd.toISOString().slice(0, 19).replace('T', ' '),
                'active',
                subscriptionId
            ]
        );

        // Crea una nueva transacción
        await db.execute(
            `INSERT INTO Transactions (Date, Amount, Payment_Method, Status, Subscription_ID)
             VALUES (?, ?, ?, ?, ?)`,
            [
                new Date().toISOString().slice(0, 19).replace('T', ' '),
                9.99 * months, // Ajusta el precio según tu lógica
                'card', // O lo que corresponda
                'completed',
                subscriptionId
            ]
        );

        res.json({ message: 'Suscripción renovada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al renovar', error: error.message });
    }
});

module.exports = router;