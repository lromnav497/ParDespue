const GeneralController = require('./generalController');
const subscriptionModel = require('../models/subscriptionModel');

class SubscriptionController extends GeneralController {
    constructor() {
        super(subscriptionModel);
    }
}

module.exports = new SubscriptionController();