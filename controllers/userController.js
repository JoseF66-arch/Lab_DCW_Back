const User = require('../models/User')

// Obtener todos los usuarios (solo admin)
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select('-password')
    res.json(usuarios)
  } catch (err) {
    console.error('Error al obtener usuarios:', err)
    res.status(500).json({ message: 'Error al obtener usuarios' })
  }
}

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select('-password')
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    res.json(usuario)
  } catch (err) {
    console.error('Error al buscar usuario:', err)
    res.status(500).json({ message: 'Error al buscar usuario' })
  }
}

// Actualizar un usuario (admin o el mismo usuario)
const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, email, rol } = req.body
    const actualizacion = { nombre, email }

    // Solo un admin puede cambiar el rol
    if (rol && req.user.rol === 'admin') {
      actualizacion.rol = rol
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id,
      actualizacion,
      { new: true, runValidators: true }
    ).select('-password')

    if (!usuarioActualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json(usuarioActualizado)
  } catch (err) {
    console.error('Error al actualizar usuario:', err)
    res.status(500).json({ message: 'Error al actualizar usuario' })
  }
}

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const usuarioEliminado = await User.findByIdAndDelete(req.params.id)
    if (!usuarioEliminado) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json({ message: 'Usuario eliminado correctamente' })
  } catch (err) {
    console.error('Error al eliminar usuario:', err)
    res.status(500).json({ message: 'Error al eliminar usuario' })
  }
}

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
}
