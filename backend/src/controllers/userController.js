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
  update: async (req, res) => {
    const { id } = req.params;
    try {
      await UserModel.update(id, {
        Name: req.body.name,
        Email: req.body.email,
        Role: req.body.role // <-- debe ser 'Role' con mayúscula si así está en la BD
      });
      res.json({ message: 'Usuario actualizado correctamente' });
    } catch (err) {
      res.status(500).json({ message: 'Error al actualizar usuario', error: err.message });
    }
  },
  // ...otros métodos...
};

module.exports = UserController;