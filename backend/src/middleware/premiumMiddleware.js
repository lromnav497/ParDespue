const SubscriptionModel = require('../models/subscriptionModel');

const requirePremium = async (req, res, next) => {
  try {
    // Si usas authMiddleware, req.user.id estará disponible
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: 'No autenticado.' });

    const plan = await SubscriptionModel.getUserPlan(userId);
    if (!plan || (plan.nombre && plan.nombre.toLowerCase() !== 'premium')) {
      return res.status(403).json({ message: 'Solo usuarios Premium pueden editar cápsulas.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verificando plan.' });
  }
};

module.exports = requirePremium;