const ContentModel = require('../models/contentModel');

class ContentController {
  async create(req, res) {
    try {
      const content = await ContentModel.create(req.body);
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async findByCapsule(req, res) {
    try {
      const contents = await ContentModel.findByCapsule(req.params.capsuleId);
      res.status(200).json(contents);
    } catch (error) {
      console.error('Error en findByCapsule:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ContentController();