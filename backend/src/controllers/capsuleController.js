const GeneralController = require('./generalController');
const capsuleModel = require('../models/capsuleModel');

class CapsuleController extends GeneralController {
    constructor() {
        super(capsuleModel);
    }

    // Método específico para buscar cápsulas por privacidad
    async findByPrivacy(req, res) {
        try {
            const capsules = await this.model.findByPrivacy(req.params.privacy);
            res.status(200).json(capsules);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Obtener cápsulas por usuario
    async findByUser(req, res) {
        try {
            const capsules = await this.model.findByUser(req.params.userId);
            console.log('Capsules enviadas al frontend:', capsules); // <-- Agrega esto
            res.status(200).json(capsules);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Sobrescribe el método create para validación y errores claros
    async create(req, res) {
        try {
            const {
                Title,
                Creation_Date,
                Opening_Date,
                Privacy,
                Password = null,
                Creator_User_ID,
                Tags
            } = req.body;

            // Agrega este log:
            console.log('BODY CAPSULE:', req.body);

            // Validación en el controlador
            if (!Title || !Creation_Date || !Opening_Date || !Privacy || !Creator_User_ID) {
                return res.status(400).json({ message: 'Faltan campos obligatorios para la cápsula.' });
            }
            if (!['private', 'group', 'public'].includes(Privacy)) {
                return res.status(400).json({ message: 'Valor de privacidad inválido.' });
            }

            // Usar el método general de creación
            const newCapsule = await this.model.create({
                Title,
                Creation_Date,
                Opening_Date,
                Privacy,
                Password,
                Creator_User_ID,
                Tags
            });

            res.status(201).json(newCapsule);
        } catch (err) {
            res.status(500).json({ message: err.message || 'Error al crear la cápsula.' });
        }
    }

    async findById(req, res) {
        try {
            const capsule = await this.model.findById(req.params.id);
            if (!capsule) {
                return res.status(404).json({ message: 'Cápsula no encontrada' });
            }
            res.status(200).json(capsule);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Nuevo método para obtener cápsulas públicas con paginación
    async getPublicCapsules(req, res) {
        try {
            const { page = 1, pageSize = 9, category = '', search = '' } = req.query;
            const result = await this.model.findPublicPaginated({
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                category,
                search
            });
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new CapsuleController();