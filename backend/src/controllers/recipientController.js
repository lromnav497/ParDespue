const RecipientModel = require('../models/recipientModel');

const RecipientController = {
  add: async (req, res) => {
    try {
      const { User_ID, Capsule_ID, Role_ID } = req.body;
      await RecipientModel.add({ User_ID, Capsule_ID, Role_ID });
      res.json({ message: 'Destinatario añadido' });
    } catch (err) {
      res.status(500).json({ message: 'Error al añadir destinatario', error: err.message });
    }
  },
  remove: async (req, res) => {
    try {
      const { User_ID, Capsule_ID, Role_ID } = req.body;
      await RecipientModel.remove({ User_ID, Capsule_ID, Role_ID });
      res.json({ message: 'Destinatario eliminado' });
    } catch (err) {
      res.status(500).json({ message: 'Error al eliminar destinatario', error: err.message });
    }
  },
  removeAllByCapsule: async (req, res) => {
    try {
      const { Capsule_ID } = req.params;
      await RecipientModel.removeAllByCapsule(Capsule_ID);
      res.json({ message: 'Todos los destinatarios eliminados' });
    } catch (err) {
      res.status(500).json({ message: 'Error al eliminar destinatarios', error: err.message });
    }
  },
  findByCapsule: async (req, res) => {
    try {
      const { Capsule_ID } = req.params;
      const recipients = await RecipientModel.findByCapsule(Capsule_ID);
      res.json(recipients);
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener destinatarios', error: err.message });
    }
  }
};

module.exports = RecipientController;