const GeneralController = require('./generalController');
const commentModel = require('../models/commentModel');

class CommentController extends GeneralController {
    constructor() {
        super(commentModel);
    }

    // Editar comentario
    async updateComment(req, res) {
        try {
            const updated = await commentModel.updateComment(req.params.id, req.body);
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: 'Error al editar comentario' });
        }
    }

    // Eliminar comentario
    async deleteComment(req, res) {
        try {
            await commentModel.deleteComment(req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Error al eliminar comentario' });
        }
    }
}

module.exports = new CommentController();