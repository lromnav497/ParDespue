const express = require('express');
const router = express.Router();
const RecipientController = require('../controllers/recipientController');
const db = require('../config/db');

// Añadir destinatario
router.post('/', RecipientController.add);
// Eliminar destinatario
router.delete('/', RecipientController.remove);
// Eliminar todos los destinatarios de una cápsula
router.delete('/all/:Capsule_ID', RecipientController.removeAllByCapsule);
// Obtener destinatarios de una cápsula
router.get('/capsule/:Capsule_ID', RecipientController.findByCapsule);
// Cápsulas compartidas con el usuario
router.get('/capsule-shared/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.execute(
      `SELECT 
          c.Capsule_ID,
          c.Title,
          c.Description,
          c.Opening_Date,
          c.Creation_Date,
          c.Cover_Image,
          c.Category_ID,
          cat.Name as Category_Name,
          c.Privacy,
          r.Role_ID,
          ro.Name as RoleName
        FROM Recipients r
        INNER JOIN Capsules c ON r.Capsule_ID = c.Capsule_ID
        LEFT JOIN Categories cat ON c.Category_ID = cat.Category_ID
        INNER JOIN Roles ro ON r.Role_ID = ro.Role_ID
        WHERE r.User_ID = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error en /capsule-shared/:userId:', err);
    res.status(500).json({ message: 'Error al obtener cápsulas compartidas', error: err.message });
  }
});

module.exports = router;