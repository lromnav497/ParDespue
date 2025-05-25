class GeneralController {
    constructor(model) {
        this.model = model;
    }

    async create(req, res) {
        try {
            const result = await this.model.create(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const records = await this.model.findAll();
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findOne(req, res) {
        try {
            const record = await this.model.findOne(req.params.id);
            if (!record) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }
            res.status(200).json(record);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await this.model.update(req.params.id, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await this.model.delete(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = GeneralController;