const express = require('express');
const GeneralModel = require('../models/generalModel');

const createGeneralRouter = (tableName) => {
    const router = express.Router();
    const model = new GeneralModel(tableName);

    // Crear un registro
    router.post('/', async (req, res) => {
        try {
            const result = await model.create(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Obtener todos los registros
    router.get('/', async (req, res) => {
        try {
            const records = await model.findAll();
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Obtener un registro por ID
    router.get('/:id', async (req, res) => {
        try {
            const record = await model.findOne(req.params.id);
            if (!record) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }
            res.status(200).json(record);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Actualizar un registro
    router.put('/:id', async (req, res) => {
        try {
            const result = await model.update(req.params.id, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Eliminar un registro
    router.delete('/:id', async (req, res) => {
        try {
            const result = await model.delete(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};

module.exports = createGeneralRouter;