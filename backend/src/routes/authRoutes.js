const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const pool = require('../config/db');
const crypto = require('crypto');
const Mailjet = require('node-mailjet');

// Aquí importa y configura Mailjet usando variables de entorno
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        console.log('Intentando registrar usuario:', email);

        // Verifica si el usuario ya existe
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            console.log('Correo ya registrado:', email);
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // Hashea la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Genera un token de verificación
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Crea el usuario con Verified = false
        await userModel.create({
            Name: name,
            Email: email,
            Password: hashedPassword,
            Role: 'standard',
            Verified: false,
            VerificationToken: verificationToken
        });

        // Genera el enlace de verificación
        const verifyUrl = `http://44.209.31.187:3000/verify-email?token=${verificationToken}`;
        console.log('Enviando correo de verificación a:', email);

        // Envía el correo con Mailjet
        await mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: "lromnav497@gmail.com",
                            Name: "ParDespue Team"
                        },
                        To: [
                            {
                                Email: email,
                                Name: name
                            }
                        ],
                        Subject: "Verifica tu cuenta",
                        TextPart: `Haz clic en el siguiente enlace para verificar tu cuenta: ${verifyUrl}`,
                        HTMLPart: `
                          <div style="font-family:Arial,sans-serif;background:#f9f9f9;padding:30px;">
                            <h2 style="color:#2E2E7A;">¡Bienvenido a ParDespue!</h2>
                            <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el botón:</p>
                            <a href="${verifyUrl}" style="display:inline-block;background:#F5E050;color:#2E2E7A;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:20px 0;">Verificar cuenta</a>
                            <p>Si no solicitaste este registro, puedes ignorar este correo.</p>
                            <hr style="margin:24px 0;">
                            <small style="color:#888;">ParDespue Team</small>
                          </div>
                        `
                    }
                ]
            });

        console.log('Correo enviado correctamente');
        res.status(201).json({ message: 'Usuario registrado correctamente. Revisa tu correo para verificar tu cuenta.' });
    } catch (error) {
        console.error('Error en /register:', error);
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
        if (!user.Verified) {
            return res.status(403).json({ message: 'Usuario no verificado. Revisa tu correo para activarlo.' });
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

router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const [result] = await pool.query(
      'UPDATE Users SET Verified = true, VerificationToken = NULL WHERE VerificationToken = ?', [token]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Token inválido o expirado' });
    }
    res.json({ message: 'Usuario verificado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (user.Verified) {
      return res.status(400).json({ message: 'El usuario ya está verificado.' });
    }
    // Si no tiene token, genera uno nuevo
    let verificationToken = user.VerificationToken;
    if (!verificationToken) {
      verificationToken = crypto.randomBytes(32).toString('hex');
      await pool.query('UPDATE Users SET VerificationToken = ? WHERE Email = ?', [verificationToken, email]);
    }
    const verifyUrl = `http://44.209.31.187:3000/verify-email?token=${verificationToken}`;
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: "lromnav497@gmail.com", Name: "ParDespue Team" },
          To: [{ Email: email, Name: user.Name }],
          Subject: "Verifica tu cuenta",
          TextPart: `Haz clic en el siguiente enlace para verificar tu cuenta: ${verifyUrl}`,
          HTMLPart: `<h3>¡Bienvenido de nuevo!</h3>
            <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
            <a href="${verifyUrl}" style="background:#F5E050;color:#2E2E7A;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:bold;">Verificar cuenta</a>
            <p>Si no solicitaste este correo, ignóralo.</p>`
        }
      ]
    });
    res.json({ message: 'Correo de verificación reenviado. Revisa tu bandeja de entrada.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;