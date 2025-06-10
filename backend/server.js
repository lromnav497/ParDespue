const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const userRoutes = require('./src/routes/userRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const capsuleRoutes = require('./src/routes/capsuleRoutes');
const contentRoutes = require('./src/routes/contentRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const recipientRoutes = require('./src/routes/recipientRoutes');
const authRoutes = require('./src/routes/authRoutes');
const errorMiddleware = require('./src/middleware/errorMiddleware');
const cors = require('cors');
const uploadRoutes = require('./src/routes/uploadRoutes');
const path = require('path');

// Cargar el archivo Swagger
const swaggerDocument = yaml.load('./src/docs/swagger.yaml');

const app = express();

// Middleware para parsear JSON
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ limit: '1000mb', extended: true }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://44.209.31.187'
  ],
  credentials: true
}));

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/recipients', recipientRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware de manejo de errores
app.use(errorMiddleware);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Documentación disponible en http://44.209.31.187:${PORT}/api-docs`);
});