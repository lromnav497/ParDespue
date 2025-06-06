const express = require('express');
const UserController = require('../controllers/userController');
const createGeneralRouter = require('./generalRoutes');
const userModel = require('../models/userModel');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Asegúrate de tener la configuración de la base de datos
const multer = require('multer');
const path = require('path');

const router = express.Router(); // Usa un router limpio

// Configuración de Multer para la carga de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_pics');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

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

// Actualizar foto de perfil
router.put('/:id/profile-picture', authMiddleware, upload.single('profile_picture'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!req.file) return res.status(400).json({ message: 'No se subió ninguna imagen' });
    const profilePictureUrl = `/uploads/profile_pics/${req.file.filename}`;
    await userModel.update(userId, { Profile_Picture: profilePictureUrl });
    res.json({ message: 'Foto de perfil actualizada', profilePicture: profilePictureUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todos los usuarios (solo admin)
router.get('/all', authMiddleware, roleMiddleware('administrator'), async (req, res) => {
  const [users] = await userModel.getAll();
  res.json(users);
});

// Banear usuario (solo admin)
router.put('/:id/ban', authMiddleware, roleMiddleware('administrator'), async (req, res) => {
  const userId = req.params.id;
  await userModel.update(userId, { VerificationToken: 'banned' });
  res.json({ message: 'Usuario baneado' });
});

// Desbanear usuario (solo admin)
router.put('/:id/unban', authMiddleware, roleMiddleware('administrator'), async (req, res) => {
  const userId = req.params.id;
  await userModel.update(userId, { VerificationToken: null });
  res.json({ message: 'Usuario desbaneado' });
});

// Exportar datos del usuario en formato CSV
router.get('/me/export', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // Ejecuta el procedimiento almacenado
    const [rows] = await db.query('CALL GetAllUserData(?)', [userId]);
    // El resultado de un CALL es un array de arrays, el primero es el resultado
    const data = rows[0];
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al exportar los datos' });
  }
});

// LUEGO agrega las rutas generales
router.use('/', createGeneralRouter('Users'));

module.exports = router;