const express = require('express');
const router = express.Router();
const CapsuleController = require('../controllers/capsuleController');
const capsuleModel = require('../models/capsuleModel');
const db = require('../config/db');

router.post('/', (req, res) => CapsuleController.create(req, res));
router.get('/privacy/:privacy', async (req, res) => {
    try {
        const capsules = await capsuleModel.findByPrivacy(req.params.privacy);
        res.status(200).json(capsules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/user/:userId', (req, res) => CapsuleController.findByUser(req, res));
router.get('/public', (req, res) => CapsuleController.getPublicCapsules(req, res));
// Obtener cápsula por ID con todos los campos y contenidos
router.get('/:id', async (req, res) => {
  const capsuleId = req.params.id;
  // Supón que recibes el userId por cabecera (ajusta según tu auth)
  const userId = req.headers['x-user-id'];

  try {
    const [capsuleRows] = await db.query(
      `SELECT c.Capsule_ID, c.Title, c.Description, c.Opening_Date, c.Privacy, c.Tags, c.Creation_Date,
              c.Category_ID, cat.Name as Category_Name, cat.Description as Category_Description,
              c.Password, c.Creator_User_ID
       FROM Capsules c
       INNER JOIN Categories cat ON c.Category_ID = cat.Category_ID
       WHERE c.Capsule_ID = ?`, [capsuleId]
    );
    if (!capsuleRows.length) return res.status(404).json({ message: 'Cápsula no encontrada' });
    const capsule = capsuleRows[0];

    const [contents] = await db.query(
      `SELECT Content_ID, Type, File_Path, Creation_Date FROM Contents WHERE Capsule_ID = ?`, [capsuleId]
    );
    const images = contents.filter(c => c.Type === 'image').map(c => ({ id: c.Content_ID, url: c.File_Path }));
    const videos = contents.filter(c => c.Type === 'video').map(c => ({ id: c.Content_ID, url: c.File_Path }));
    const audios = contents.filter(c => c.Type === 'audio').map(c => ({ id: c.Content_ID, url: c.File_Path }));
    const messages = contents.filter(c => c.Type === 'text').map(c => ({ id: c.Content_ID, contenido: c.File_Path }));

    // Solo el dueño recibe la contraseña real, los demás solo booleano
    let passwordField;
    if (userId && Number(userId) === capsule.Creator_User_ID) {
      passwordField = capsule.Password || '';
    } else {
      passwordField = !!capsule.Password;
    }

    res.json({
      ...capsule,
      Password: passwordField,
      Category: { 
        Category_ID: capsule.Category_ID, 
        Name: capsule.Category_Name, 
        Description: capsule.Category_Description 
      },
      Images: images,
      Videos: videos,
      Audios: audios,
      Messages: messages
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la cápsula', error: err.message });
  }
});
router.put('/:id', (req, res) => CapsuleController.update(req, res));
router.delete('/:id', async (req, res) => {
  const capsuleId = req.params.id;
  const userId = req.body.userId || req.headers['x-user-id']; // Ajusta según tu frontend

  // Busca el dueño de la cápsula
  const [rows] = await db.query('SELECT Creator_User_ID FROM Capsules WHERE Capsule_ID = ?', [capsuleId]);
  if (!rows.length) return res.status(404).json({ message: 'Cápsula no encontrada' });

  if (rows[0].Creator_User_ID != userId) {
    return res.status(403).json({ message: 'Solo el creador puede eliminar esta cápsula.' });
  }

  // Elimina la cápsula
  await db.query('DELETE FROM Capsules WHERE Capsule_ID = ?', [capsuleId]);
  res.json({ message: 'Cápsula eliminada correctamente.' });
});
router.post('/:id/check-password', async (req, res) => {
  const { password } = req.body;
  const capsuleId = req.params.id;
  const [rows] = await db.query('SELECT Password FROM Capsules WHERE Capsule_ID = ?', [capsuleId]);
  if (!rows.length) return res.status(404).json({ valid: false });
  const valid = rows[0].Password === password;
  res.json({ valid });
});

module.exports = router;