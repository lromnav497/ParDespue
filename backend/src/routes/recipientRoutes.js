const express = require('express');
const RecipientController = require('../controllers/recipientController');
const router = express.Router();

router.post('/', RecipientController.create);

// Ruta específica para obtener un destinatario por clave compuesta
router.get('/:userId/:capsuleId/:roleId', async (req, res) => {
    try {
        const recipient = await recipientModel.findByCompositeKey(
            req.params.userId,
            req.params.capsuleId,
            req.params.roleId
        );
        if (!recipient) {
            return res.status(404).json({ message: 'Destinatario no encontrado' });
        }
        res.status(200).json(recipient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;