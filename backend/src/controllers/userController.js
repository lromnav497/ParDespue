const UserModel = require('../models/userModel');

const UserController = {
  findByEmail: async (req, res) => {
    try {
      const user = await UserModel.findByEmail(req.params.email);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Error al buscar usuario', error: err.message });
    }
  },
  // ...otros métodos...
};

module.exports = UserController;