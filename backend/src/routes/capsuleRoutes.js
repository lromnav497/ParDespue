const express = require('express');
const router = express.Router();
const CapsuleController = require('../controllers/capsuleController');
const capsuleModel = require('../models/capsuleModel');

router.post('/', (req, res) => CapsuleController.create(req, res));
router.get('/privacy/:privacy', async (req, res) => {
    try {
        const capsules = await capsuleModel.findByPrivacy(req.params.privacy);
        res.status(200).json(capsules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/user/:userId', (req, res) => CapsuleController.findByUser(req, res));
router.get('/public', (req, res) => CapsuleController.getPublicCapsules(req, res));
router.get('/:id', (req, res) => CapsuleController.findById(req, res));
router.put('/:id', (req, res) => CapsuleController.update(req, res));
router.delete('/:id', (req, res) => CapsuleController.delete(req, res));

module.exports = router;