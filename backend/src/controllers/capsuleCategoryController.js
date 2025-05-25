const CapsuleCategoryModel = require('../models/capsuleCategoryModel');

const CapsuleCategoryController = {
  create: async (req, res) => {
    try {
      const { Capsule_ID, Category_ID } = req.body;
      if (!Capsule_ID || !Category_ID) {
        return res.status(400).json({ message: 'Faltan datos.' });
      }
      const association = await CapsuleCategoryModel.create({ Capsule_ID, Category_ID });
      res.status(201).json({ message: 'Asociación creada.', ...association });
    } catch (err) {
      res.status(500).json({ message: 'Error al asociar categoría.', error: err.message });
    }
  }
};

module.exports = CapsuleCategoryController;