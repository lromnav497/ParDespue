const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Espera un token en el formato "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó un token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adjunta los datos del usuario al objeto `req`
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

const roleMiddleware = (requiredRole) => (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'No tienes permiso para acceder a este recurso' });
    }
    next();
};

module.exports = { authMiddleware, roleMiddleware };