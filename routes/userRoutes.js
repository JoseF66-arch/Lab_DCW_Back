const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { verificarToken } = require('../middleware/authMiddleware')
const { verificarAdmin } = require('../middleware/verificarAdmin')
const bcrypt = require('bcryptjs')

// Middleware global para proteger todas las rutas
router.use(verificarToken)

// Ruta para actualizar el perfil del usuario actual
router.put('/update-profile', async (req, res) => {
  try {
    const { nombre, email, password } = req.body
    const userId = req.user.id

    // Verificar si el email ya está en uso por otro usuario
    if (email) {
      const emailExistente = await User.findOne({ email, _id: { $ne: userId } })
      if (emailExistente) {
        return res.status(400).json({ message: 'El email ya está en uso' })
      }
    }

    // Preparar los datos a actualizar
    const datosActualizar = {
      nombre,
      email
    }

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      const salt = await bcrypt.genSalt(10)
      datosActualizar.password = await bcrypt.hash(password, salt)
    }

    // Actualizar el usuario
    const usuarioActualizado = await User.findByIdAndUpdate(
      userId,
      datosActualizar,
      { new: true }
    ).select('-password')

    if (!usuarioActualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json(usuarioActualizado)
  } catch (err) {
    console.error('Error al actualizar perfil:', err)
    res.status(500).json({ message: 'Error al actualizar el perfil' })
  }
})

// Rutas que requieren ser admin
router.use(verificarAdmin)

// Obtener todos los usuarios (solo admin)
router.get('/', async (req, res) => {
  try {
    const usuarios = await User.find().select('-password')
    res.json(usuarios)
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' })
  }
})

// Obtener un usuario por ID (solo admin)
router.get('/:id', async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select('-password')
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' })
    res.json(usuario)
  } catch (err) {
    res.status(400).json({ message: 'Error al buscar usuario' })
  }
})

// Actualizar usuario (solo admin)
router.put('/:id', async (req, res) => {
  try {
    const usuarioActualizado = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password')
    res.json(usuarioActualizado)
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar usuario' })
  }
})

// Eliminar usuario (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Usuario eliminado correctamente' })
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario' })
  }
})

module.exports = router
