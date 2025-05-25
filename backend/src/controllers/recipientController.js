const RecipientModel = require('../models/recipientModel');

const RecipientController = {
  create: async (req, res) => {
    try {
      const { User_ID, Capsule_ID, Role_ID } = req.body;
      if (!User_ID || !Capsule_ID || !Role_ID) {
        return res.status(400).json({ message: 'Faltan datos.' });
      }
      const recipient = await RecipientModel.create({ User_ID, Capsule_ID, Role_ID });
      res.status(201).json({ message: 'Destinatario añadido.', ...recipient });
    } catch (err) {
      res.status(500).json({ message: 'Error al añadir destinatario.', error: err.message });
    }
  }
};

module.exports = RecipientController;