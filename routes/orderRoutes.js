const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware.verificarToken);

// Crear una nueva orden
router.post('/', orderController.createOrder);

// Obtener todas las órdenes del usuario
router.get('/', orderController.getUserOrders);

// Obtener una orden específica
router.get('/:id', orderController.getOrderById);

module.exports = router; 