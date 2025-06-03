const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/recent', authMiddleware, notificationController.getRecent);
router.get('/all', authMiddleware, notificationController.getAll);

module.exports = router;