const express = require('express')
const router = express.Router()

const {
  obtenerUsuarios,
  eliminarUsuario,
  actualizarUsuario // ⬅️ Agregado
} = require('../controllers/adminController')

const { verificarToken } = require('../middleware/authMiddleware')
const { verificarAdmin } = require('../middleware/verificarAdmin')

// Aplicar middlewares de autenticación y autorización
router.use(verificarToken)
router.use(verificarAdmin)

// Rutas protegidas
router.get('/usuarios', obtenerUsuarios)
router.delete('/usuarios/:id', eliminarUsuario)
router.put('/usuarios/:id', actualizarUsuario) // ⬅️ Agregado

module.exports = router
