const RoleModel = require('../models/roleModel');

const RoleController = {
  findByName: async (req, res) => {
    try {
      const role = await RoleModel.findByName(req.params.name);
      if (!role) return res.status(404).json({ message: 'Rol no encontrado' });
      res.json(role);
    } catch (err) {
      res.status(500).json({ message: 'Error al buscar rol', error: err.message });
    }
  },
  findAll: async (req, res) => {
    try {
      const roles = await RoleModel.findAll();
      res.json(roles);
    } catch (err) {
      res.status(500).json({ message: 'Error al listar roles', error: err.message });
    }
  }
};

module.exports = RoleController;