const Joi = require('joi');

const validationMiddleware = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Error de validación',
            details: error.details.map((detail) => detail.message),
        });
    }

    next();
};

module.exports = validationMiddleware;