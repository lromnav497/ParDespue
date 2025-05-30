const express = require('express');
const UserController = require('../controllers/userController');
const createGeneralRouter = require('./generalRoutes');
const userModel = require('../models/userModel');
const { authMiddleware } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Asegúrate de tener la configuración de la base de datos

const router = express.Router(); // Usa un router limpio

// RUTAS PERSONALIZADAS PRIMERO

// Buscar usuario por email usando el modelo y controlador
router.get('/email/:email', UserController.findByEmail);

// Actualizar usuario con lógica personalizada
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        const { id, role } = req.user;

        if (id !== userId && role !== 'administrator') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const { Name, Email } = req.body;
        const updateData = {};
        if (Name) updateData.Name = Name;
        if (Email) updateData.Email = Email;

        await userModel.update(userId, updateData);

        const updatedUser = await userModel.findOne(userId);
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado después de actualizar' });
        }

        res.json({
            message: 'Usuario actualizado correctamente',
            user: {
                id: updatedUser.User_ID,
                name: updatedUser.Name,
                email: updatedUser.Email,
                role: updatedUser.Role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cambiar contraseña
router.put('/:id/password', authMiddleware, async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        const { id, role } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (id !== userId && role !== 'administrator') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        const user = await userModel.findOne(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.Password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userModel.update(userId, { Password: hashedPassword });

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LUEGO agrega las rutas generales
router.use('/', createGeneralRouter('Users'));

module.exports = router;