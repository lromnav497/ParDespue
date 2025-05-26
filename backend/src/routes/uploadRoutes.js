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

// Configuración de multer para temporal
const storageTmp = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.body.userId || req.query.userId;
    if (!userId) return cb(new Error('Falta userId'), null);
    const dir = path.join(__dirname, '../../uploads/tmp', String(userId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadTmp = multer({ storage: storageTmp });

router.post('/tmp', uploadTmp.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo.' });
  }
  const userId = req.body.userId || req.query.userId;
  const relativePath = `tmp/${userId}/${req.file.filename}`;
  res.json({
    filePath: `/uploads/${relativePath}`,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype
  });
});

router.post('/move', async (req, res) => {
  const { userId, capsuleId, tmpPath } = req.body;
  if (!userId || !capsuleId || !tmpPath) {
    return res.status(400).json({ message: 'Faltan datos para mover el archivo.' });
  }
  // Quita el prefijo /uploads/ si lo tiene
  const tmpFileName = tmpPath.replace(/^\/?uploads\//, '');
  const src = path.join(__dirname, '../../uploads', tmpFileName);
  const destDir = path.join(__dirname, '../../uploads', String(userId), String(capsuleId));
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, path.basename(src));
  try {
    fs.renameSync(src, dest);
    // Devuelve la ruta relativa definitiva
    const relativePath = `${userId}/${capsuleId}/${path.basename(dest)}`;
    res.json({ filePath: `/uploads/${relativePath}` });
  } catch (err) {
    res.status(500).json({ message: 'No se pudo mover el archivo', error: err.message });
  }
});

module.exports = router;