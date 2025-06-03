const UserModel = require('../models/userModel');
const NotificationModel = require('../models/notificationModel'); // Asegúrate de tener el modelo de notificación

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
  createNotification: async (req, res) => {
    const { userId } = req.body;
    try {
      await NotificationModel.create({
        userId: userId,
        capsuleId: 0, // o null si lo permites en la BD
        message: '¡Bienvenido a ParDespue! Ya puedes crear y recibir cápsulas.',
        sentDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
      res.json({ message: 'Notificación creada y enviada al usuario' });
    } catch (err) {
      res.status(500).json({ message: 'Error al crear notificación', error: err.message });
    }
  },
  // ...otros métodos...
};

module.exports = UserController;