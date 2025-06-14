const express = require('express')
const router = express.Router()
const { verificarToken } = require('../middleware/authMiddleware')
const {
  obtenerCarrito,
  agregarAlCarrito,
  eliminarDelCarrito,
  actualizarCantidad
} = require('../controllers/cartController')

// Todas las rutas requieren autenticación
router.use(verificarToken)

// Obtener carrito
router.get('/', obtenerCarrito)

// Agregar servicio al carrito
router.post('/', agregarAlCarrito)

// Eliminar servicio del carrito
router.delete('/:servicioId', eliminarDelCarrito)

// Actualizar cantidad
router.put('/:servicioId', actualizarCantidad)

module.exports = router
