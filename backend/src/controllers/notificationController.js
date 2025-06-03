const GeneralController = require('./generalController');
const NotificationModel = require('../models/notificationModel');

class NotificationController extends GeneralController {
    constructor() {
        super(NotificationModel);
    }
}

const getRecent = async (req, res) => {
  const userId = req.user.id;
  const notifications = await NotificationModel.getRecent(userId);
  res.json(notifications);
};

const getAll = async (req, res) => {
  const userId = req.user.id;
  const notifications = await NotificationModel.getAll(userId);
  res.json(notifications);
};

module.exports = {
  getRecent,
  getAll,
  // ...other handlers
};