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
  try {
    const [capsuleRows] = await db.query(
      `SELECT c.Capsule_ID, c.Title, c.Description, c.Opening_Date, c.Privacy, c.Tags, c.Creation_Date,
              c.Category_ID, cat.Name as Category_Name, cat.Description as Category_Description
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

    res.json({
      ...capsule,
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
router.delete('/:id', (req, res) => CapsuleController.delete(req, res));

module.exports = router;