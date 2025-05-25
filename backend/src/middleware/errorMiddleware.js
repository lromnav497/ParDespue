const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorMiddleware;