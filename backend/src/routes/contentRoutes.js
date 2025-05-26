const express = require('express');
const router = express.Router();
const ContentController = require('../controllers/contentController');
const contentModel = require('../models/contentModel');

router.post('/', ContentController.create);
router.get('/capsule/:capsuleId', ContentController.findByCapsule);
router.delete('/:id', async (req, res) => {
  try {
    await contentModel.delete(req.params.id);
    res.json({ message: 'Archivo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;