const Service = require('../models/Service')
const fs = require('fs').promises
const path = require('path')

// Obtener todos los servicios
const obtenerServicios = async (req, res) => {
  try {
    const servicios = await Service.find()
    res.json(servicios)
  } catch (err) {
    console.error('Error al obtener servicios:', err)
    res.status(500).json({ message: 'Error al obtener servicios' })
  }
}

// Obtener un servicio por ID
const obtenerServicio = async (req, res) => {
  try {
    const servicio = await Service.findById(req.params.id)
    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' })
    }
    res.json(servicio)
  } catch (err) {
    console.error('Error al obtener servicio:', err)
    res.status(500).json({ message: 'Error al obtener servicio' })
  }
}

// Crear un nuevo servicio
const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, costo, categoria } = req.body
    const imagen = req.file ? `/uploads/servicios/${req.file.filename}` : null

    if (!imagen) {
      return res.status(400).json({ message: 'La imagen es requerida' })
    }

    const servicio = await Service.create({
      nombre,
      descripcion,
      costo,
      categoria,
      imagen
    })

    res.status(201).json(servicio)
  } catch (err) {
    console.error('Error al crear servicio:', err)
    res.status(500).json({ message: 'Error al crear servicio' })
  }
}

// Actualizar un servicio
const actualizarServicio = async (req, res) => {
  try {
    const { nombre, descripcion, costo, categoria, activo } = req.body
    const actualizacion = { nombre, descripcion, costo, categoria, activo }

    if (req.file) {
      // Eliminar imagen anterior
      const servicioAnterior = await Service.findById(req.params.id)
      if (servicioAnterior?.imagen) {
        const rutaImagenAnterior = path.join(__dirname, '..', servicioAnterior.imagen)
        try {
          await fs.unlink(rutaImagenAnterior)
        } catch (err) {
          console.error('Error al eliminar imagen anterior:', err)
        }
      }
      actualizacion.imagen = `/uploads/servicios/${req.file.filename}`
    }

    const servicio = await Service.findByIdAndUpdate(
      req.params.id,
      actualizacion,
      { new: true, runValidators: true }
    )

    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' })
    }

    res.json(servicio)
  } catch (err) {
    console.error('Error al actualizar servicio:', err)
    res.status(500).json({ message: 'Error al actualizar servicio' })
  }
}

// Eliminar un servicio
const eliminarServicio = async (req, res) => {
  try {
    const servicio = await Service.findById(req.params.id)
    
    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' })
    }

    // Eliminar imagen
    if (servicio.imagen) {
      const rutaImagen = path.join(__dirname, '..', servicio.imagen)
      try {
        await fs.unlink(rutaImagen)
      } catch (err) {
        console.error('Error al eliminar imagen:', err)
      }
    }

    await servicio.deleteOne()
    res.json({ message: 'Servicio eliminado correctamente' })
  } catch (err) {
    console.error('Error al eliminar servicio:', err)
    res.status(500).json({ message: 'Error al eliminar servicio' })
  }
}

module.exports = {
  obtenerServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  eliminarServicio
} 