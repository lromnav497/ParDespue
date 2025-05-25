const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Verifica si el usuario ya existe
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // Hashea la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea el usuario
        const user = await userModel.create({
            Name: name,
            Email: email,
            Password: hashedPassword,
            Role: 'standard' // Cambiado de 'user' a 'standard'
        });

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }
        const valid = await bcrypt.compare(password, user.Password);
        if (!valid) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }
        // Genera el token
        const token = jwt.sign(
            { id: user.User_ID, email: user.Email, role: user.Role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        res.json({ token, user: { id: user.User_ID, name: user.Name, email: user.Email, role: user.Role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;