const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Obtener comentarios de una cápsula
router.get('/', async (req, res) => {
  const { Capsule_ID } = req.query;
  if (!Capsule_ID) return res.status(400).json({ error: 'Capsule_ID requerido' });
  const comentarios = await commentController.model.findByCapsuleId(Capsule_ID);
  res.json(comentarios);
});

// Crear comentario
router.post('/', async (req, res) => {
  try {
    const comentario = await commentController.model.createComment(req.body);
    res.status(201).json(comentario);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear comentario' });
  }
});

// Editar comentario
router.put('/:id', commentController.updateComment.bind(commentController));

// Eliminar comentario
router.delete('/:id', commentController.deleteComment.bind(commentController));

module.exports = router;