const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Espera userId y capsuleId en el body (form-data)
    const userId = req.body.userId || req.query.userId;
    const capsuleId = req.body.capsuleId || req.query.capsuleId;
    if (!userId || !capsuleId) {
      return cb(new Error('Faltan userId o capsuleId'), null);
    }
    const dir = path.join(__dirname, '../../uploads', String(userId), String(capsuleId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo.' });
  }
  // Devuelve la ruta relativa para guardar en la BD
  const userId = req.body.userId || req.query.userId;
  const capsuleId = req.body.capsuleId || req.query.capsuleId;
  const relativePath = `${userId}/${capsuleId}/${req.file.filename}`;
  res.json({
    filePath: `/uploads/${relativePath}`,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype
  });
});

// Ruta para eliminar archivo físico
router.delete('/delete', (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ message: 'Falta filePath' });

  // Quita el prefijo /uploads/ si lo tiene
  const fileName = filePath.replace(/^\/?uploads\//, '');
  const fullPath = path.join(__dirname, '../../uploads', fileName);

  fs.unlink(fullPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'No se pudo eliminar el archivo', error: err.message });
    }
    res.json({ message: 'Archivo eliminado' });
  });
});

module.exports = router;