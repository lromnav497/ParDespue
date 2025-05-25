const express = require('express');
const RoleController = require('../controllers/roleController');
const router = express.Router();

router.get('/', RoleController.findAll);
router.get('/:name', RoleController.findByName);

module.exports = router;