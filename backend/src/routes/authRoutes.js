const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const pool = require('../config/db');
const crypto = require('crypto');
const Mailjet = require('node-mailjet');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Aquí importa y configura Mailjet usando variables de entorno
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

const router = express.Router();

// Multer: primero guarda en una carpeta temporal
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profile_pics/temp';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: tempStorage });

// REGISTRO
router.post('/register', upload.single('profile_picture'), async (req, res) => {
  try {
    // 1. Crea el usuario sin foto
    const { name, email, password } = req.body;
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
    const result = await userModel.create({
        Name: name,
        Email: email,
        Password: hashedPassword,
        Role: 'standard',
        Verified: false,
        VerificationToken: verificationToken,
        Profile_Picture: null
    });
    const userId = result.insertId;

    // 2. Si hay imagen, muévela a la carpeta del usuario
    let profilePictureUrl = null;
    if (req.file) {
      const userDir = `uploads/profile_pics/${userId}`;
      if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
      const destPath = `${userDir}/${req.file.filename}`;
      fs.renameSync(req.file.path, destPath);
      profilePictureUrl = `/uploads/profile_pics/${userId}/${req.file.filename}`;
      await userModel.update(userId, { Profile_Picture: profilePictureUrl });
    }

    // Genera el enlace de verificación
    const verifyUrl = `http://44.209.31.187/verify-email?token=${verificationToken}`;
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
  const { email, password, remember } = req.body;
  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    }
    if (user.VerificationToken === 'banned') {
      return res.status(403).json({ message: 'Usuario baneado. Contacta al administrador.' });
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
      { id: user.User_ID, email: user.Email, role: user.Role, Profile_Picture: user.Profile_Picture },
      process.env.JWT_SECRET,
      { expiresIn: remember ? '30d' : '2h' } // Si remember, sin expiración
    );
    res.json({ token, user: { id: user.User_ID, name: user.Name, email: user.Email, role: user.Role, Profile_Picture: user.Profile_Picture } });
  } catch (error) {
    console.error(error); // <-- Esto te mostrará el error real en consola
    res.status(500).json({ message: 'Error interno del servidor' });
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
    const verifyUrl = `http://44.209.31.187/verify-email?token=${verificationToken}`;
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

router.post('/recover-password', async (req, res) => {
  const { email } = req.body;
  try {
    // Busca el usuario por email (no revela si existe o no para seguridad)
    const user = await userModel.findByEmail(email);
    if (!user) {
      // No reveles si el correo existe o no (respuesta genérica)
      return res.json({ message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña' });
    }
    // Genera un token de recuperación seguro y una fecha de expiración (1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    // Guarda el token y su expiración en la base de datos del usuario
    await pool.query(
      'UPDATE Users SET ResetToken = ?, ResetTokenExpires = ? WHERE Email = ?',
      [resetToken, resetTokenExpires, email]
    );

    // Construye el enlace de recuperación de contraseña (ajusta la URL a tu frontend)
    const resetUrl = `http://44.209.31.187/reset-password?token=${resetToken}`;

    // Envía el correo de recuperación usando Mailjet
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: "lromnav497@gmail.com", Name: "ParDespue Team" },
          To: [{ Email: email, Name: user.Name }],
          Subject: "Recupera tu contraseña",
          TextPart: `Haz clic en el siguiente enlace para recuperar tu contraseña: ${resetUrl}`,
          HTMLPart: `
            <h3>Recupera tu contraseña</h3>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <a href="${resetUrl}" style="background:#F5E050;color:#2E2E7A;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:bold;">Restablecer contraseña</a>
            <p>Si no solicitaste este correo, ignóralo.</p>
          `
        }
      ]
    });

    // Respuesta genérica para evitar revelar si el correo existe
    res.json({ message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña' });
  } catch (error) {
    // Manejo de errores generales
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    // Busca usuario por token y verifica que no haya expirado
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE ResetToken = ? AND ResetTokenExpires > NOW()',
      [token]
    );
    if (!rows.length) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE Users SET Password = ?, ResetToken = NULL, ResetTokenExpires = NULL WHERE ResetToken = ?',
      [hashedPassword, token]
    );
    res.json({ message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;