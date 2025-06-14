const GeneralController = require('./generalController');
const CapsuleModel = require('../models/capsuleModel');
const SubscriptionModel = require('../models/subscriptionModel');
const NotificationModel = require('../models/notificationModel');

class CapsuleController extends GeneralController {
    constructor() {
        super(CapsuleModel);
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
                Description,
                Creation_Date,
                Opening_Date,
                Privacy,
                Password = null,
                Creator_User_ID,
                Tags,
                Category_ID,
                Cover_Image
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
            if (new Date(Opening_Date) <= new Date(Creation_Date)) {
                return res.status(400).json({ message: 'La fecha de apertura debe ser posterior a la de creación.' });
            }

            const userId = Creator_User_ID;
            const plan = await SubscriptionModel.getUserPlan(userId);
            const total = await SubscriptionModel.countUserCapsules(userId);
            if (plan === 'Básico' && total >= 15) {
                return res.status(403).json({ message: 'Límite de cápsulas alcanzado para el plan Básico.' });
            }

            // Usar el método general de creación
            const newCapsule = await this.model.create({
                Title,
                Description,
                Creation_Date,
                Opening_Date,
                Privacy,
                Password,
                Creator_User_ID,
                Tags,
                Category_ID,
                Cover_Image
            });

            // Enviar notificación si corresponde
            if (req.body.notificaciones) {
                const openingDate = new Date(req.body.Opening_Date);
                const notificationDate = new Date(openingDate);
                notificationDate.setDate(notificationDate.getDate() - 1);
                await NotificationModel.create({
                    userId: Creator_User_ID, // <-- fix: use Creator_User_ID
                    capsuleId: newCapsule.Capsule_ID, // <-- fix: use Capsule_ID
                    message: '¡Tu cápsula está a punto de abrirse!',
                    sentDate: notificationDate.toISOString().slice(0, 19).replace('T', ' ')
                });
            }

            // RESPONDE CON EL OBJETO QUE INCLUYE Capsule_ID
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
            // Lee los parámetros de la query
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 9;
            const category = req.query.category || '';
            const search = req.query.search || '';

            // Usa el método paginado del modelo
            const result = await this.model.findPublicPaginated({ page, pageSize, category, search });
            res.json(result); // { capsulas, totalPages }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const data = { ...req.body };
            // Asegura que Category_ID sea un número
            if (typeof data.Category_ID === 'object' && data.Category_ID !== null) {
                data.Category_ID = data.Category_ID.Category_ID;
            }
            data.Category_ID = Number(data.Category_ID);

            if (data.Privacy !== 'private') {
                data.Password = null;
            }
            if (new Date(data.Opening_Date) <= new Date(data.Creation_Date)) {
                return res.status(400).json({ message: 'La fecha de apertura debe ser posterior a la de creación.' });
            }
            const updated = await this.model.update(req.params.id, data);
            // Actualiza la fecha de notificación si se proporciona una nueva fecha de apertura
            if (req.body.Opening_Date) {
                const openingDate = new Date(req.body.Opening_Date);
                const notificationDate = new Date(openingDate);
                notificationDate.setDate(notificationDate.getDate() - 1);
                await NotificationModel.updateDate({
                    userId: req.user.id,
                    capsuleId: req.params.id,
                    sentDate: notificationDate.toISOString().slice(0, 19).replace('T', ' ')
                });
            }
            res.json(updated);
        } catch (error) {
            console.error('[CapsuleController][update] Error:', error); // <--- Añade esto
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await this.model.delete(req.params.id);
            res.json({ message: 'Cápsula eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addView(req, res) {
        try {
            const { id } = req.params;
            await this.model.addView(id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async addLike(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await this.model.addLike(id, userId);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async removeLike(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await this.model.removeLike(id, userId);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async userLiked(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const liked = await this.model.userLiked(id, userId);
            res.json({ liked });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new CapsuleController();