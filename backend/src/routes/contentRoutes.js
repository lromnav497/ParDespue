const express = require('express');
const router = express.Router();
const ContentController = require('../controllers/contentController');

router.post('/', ContentController.create);
router.get('/capsule/:capsuleId', ContentController.findByCapsule);

module.exports = router;