const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const TransactionController = require('../controllers/transactionController');

const router = express.Router();

router.get('/my-transactions', authMiddleware, TransactionController.getUserTransactions);

module.exports = router;