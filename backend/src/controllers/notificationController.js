const GeneralController = require('./generalController');
const notificationModel = require('../models/notificationModel');

class NotificationController extends GeneralController {
    constructor() {
        super(notificationModel);
    }
}

module.exports = new NotificationController();