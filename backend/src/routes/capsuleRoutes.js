const express = require('express');
const router = express.Router();
const CapsuleController = require('../controllers/capsuleController');
const capsuleModel = require('../models/capsuleModel');

router.post('/', CapsuleController.create.bind(CapsuleController));

// Ruta específica para buscar cápsulas por privacidad
router.get('/privacy/:privacy', async (req, res) => {
    try {
        const capsules = await capsuleModel.findByPrivacy(req.params.privacy);
        res.status(200).json(capsules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener cápsulas por usuario
router.get('/user/:userId', CapsuleController.findByUser.bind(CapsuleController));

// *** PON ESTA ANTES DE /:id ***
router.get('/public', CapsuleController.getPublicCapsules);

// Ruta para obtener una cápsula por ID (debe ir al final)
router.get('/:id', CapsuleController.findById.bind(CapsuleController));

module.exports = router;