const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
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
  res.json({ filePath: `/uploads/${req.file.filename}`, originalName: req.file.originalname, mimeType: req.file.mimetype });
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