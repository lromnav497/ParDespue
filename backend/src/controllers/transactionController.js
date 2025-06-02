const TransactionModel = require('../models/transactionModel');

const TransactionController = {
  getUserTransactions: async (req, res) => {
    try {
      const userId = req.user.id;
      const transacciones = await TransactionModel.getUserTransactions(userId);
      res.json({ transacciones });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Error al obtener transacciones' });
    }
  }
};

module.exports = TransactionController;