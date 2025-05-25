const express = require('express');
const router = express.Router();
const CapsuleCategoryController = require('../controllers/capsuleCategoryController');

router.post('/', CapsuleCategoryController.create);

module.exports = router;