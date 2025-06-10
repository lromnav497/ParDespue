const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configuración de almacenamiento para archivos definitivos (por cápsula)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Espera userId y capsuleId en el body (form-data)
    const userId = req.body.userId || req.query.userId;
    const capsuleId = req.body.capsuleId || req.query.capsuleId;
    if (!userId || !capsuleId) {
      // Si faltan datos, retorna error
      return cb(new Error('Faltan userId o capsuleId'), null);
    }
    // Crea el directorio destino si no existe: /uploads/{userId}/{capsuleId}
    const dir = path.join(__dirname, '../../uploads', String(userId), String(capsuleId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Genera un nombre único para evitar colisiones
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Ruta para subir un archivo definitivo a una cápsula
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

// Ruta para eliminar archivo físico del sistema de archivos
router.delete('/delete', (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ message: 'Falta filePath' });

  // Quita el prefijo /uploads/ si lo tiene para obtener la ruta real
  const fileName = filePath.replace(/^\/?uploads\//, '');
  const fullPath = path.join(__dirname, '../../uploads', fileName);

  // Elimina el archivo usando fs.unlink
  fs.unlink(fullPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'No se pudo eliminar el archivo', error: err.message });
    }
    res.json({ message: 'Archivo eliminado' });
  });
});

// Configuración de multer para archivos temporales (antes de asociar a una cápsula)
const storageTmp = multer.diskStorage({
  destination: function (req, file, cb) {
    // Para archivos temporales solo se requiere userId
    console.log('BODY:', req.body, 'QUERY:', req.query); // Debug para ver los datos recibidos
    const userId = req.body.userId || req.query.userId;
    if (!userId) return cb(new Error('Falta userId'), null);
    // Carpeta temporal: /uploads/tmp/{userId}
    const dir = path.join(__dirname, '../../uploads/tmp', String(userId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Nombre único para el archivo temporal
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadTmp = multer({ storage: storageTmp });

// Ruta para subir archivo temporal (antes de crear la cápsula)
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

// Ruta para mover archivo temporal a la carpeta definitiva de la cápsula
// POST /api/upload/move
router.post('/move', async (req, res) => {
  try {
    const { userId, capsuleId, tmpPath } = req.body;
    if (!userId || !capsuleId || !tmpPath) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Quita el prefijo /uploads/ si lo tiene para obtener la ruta real
    const tmpRelative = tmpPath.replace(/^\/?uploads\//, '');
    const tmpAbsolute = path.join(__dirname, '../../uploads', tmpRelative);
    const fileName = path.basename(tmpPath);
    // Carpeta destino definitiva: /uploads/{userId}/{capsuleId}
    const destDir = path.join(__dirname, '../../uploads', String(userId), String(capsuleId));
    const destRelative = `/uploads/${userId}/${capsuleId}/${fileName}`;
    const destAbsolute = path.join(destDir, fileName);

    // Crea la carpeta destino si no existe
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Mueve el archivo temporal a la carpeta definitiva
    fs.renameSync(tmpAbsolute, destAbsolute);

    // Devuelve la nueva ruta relativa
    res.json({ filePath: destRelative });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo mover el archivo', details: err.message });
  }
});

module.exports = router;