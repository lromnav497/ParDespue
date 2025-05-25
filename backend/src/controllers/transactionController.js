const GeneralController = require('./generalController');
const transactionModel = require('../models/transactionModel');

class TransactionController extends GeneralController {
    constructor() {
        super(transactionModel);
    }
}

module.exports = new TransactionController();