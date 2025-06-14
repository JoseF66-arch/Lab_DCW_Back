const Cart = require('../models/Cart')
const Service = require('../models/Service')
const Technology = require('../models/Technology')
const mongoose = require('mongoose')

// Obtener carrito del usuario
const obtenerCarrito = async (req, res) => {
  try {
    const userId = req.user.id
    const carrito = await Cart.findOne({ userId })
      .populate('items.servicioId')
      .populate('items.tecnologiasSeleccionadas')
    res.json(carrito || { items: [] })
  } catch (err) {
    console.error('Error al obtener carrito:', err)
    res.status(500).json({ message: 'Error al obtener carrito' })
  }
}

// Agregar servicio al carrito
const agregarAlCarrito = async (req, res) => {
  try {
    const { servicioId, cantidad, tecnologiasSeleccionadas } = req.body
    const userId = req.user.id

    const servicio = await Service.findById(servicioId)
    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' })
    }

    let precioTotal = servicio.costo
    if (tecnologiasSeleccionadas && tecnologiasSeleccionadas.length > 0) {
      const tecnologias = await Technology.find({ _id: { $in: tecnologiasSeleccionadas } })
      precioTotal += tecnologias.reduce((total, tech) => total + tech.price, 0)
    }

    let carrito = await Cart.findOne({ userId })
    if (!carrito) {
      carrito = new Cart({
        userId,
        items: [{
          servicioId,
          cantidad,
          tecnologiasSeleccionadas,
          precioTotal
        }]
      })
    } else {
      const itemIndex = carrito.items.findIndex(item => 
        item.servicioId.toString() === servicioId
      )

      if (itemIndex > -1) {
        carrito.items[itemIndex].cantidad = cantidad
        carrito.items[itemIndex].tecnologiasSeleccionadas = tecnologiasSeleccionadas
        carrito.items[itemIndex].precioTotal = precioTotal
      } else {
        carrito.items.push({
          servicioId,
          cantidad,
          tecnologiasSeleccionadas,
          precioTotal
        })
      }
    }

    await carrito.save()
    await carrito.populate('items.servicioId')
    await carrito.populate('items.tecnologiasSeleccionadas')
    res.json(carrito)
  } catch (err) {
    console.error('Error al agregar al carrito:', err)
    res.status(500).json({ message: 'Error al agregar al carrito' })
  }
}

// Eliminar servicio del carrito
const eliminarDelCarrito = async (req, res) => {
  try {
    const { servicioId } = req.params
    const userId = req.user.id

    // Usar $pull para eliminar el elemento del array
    await Cart.updateOne(
      { userId: userId }, // Aseguramos que userId sea el correcto
      { $pull: { items: { servicioId: new mongoose.Types.ObjectId(servicioId) } } }
    )

    // Obtener el carrito actualizado
    const carritoActualizado = await Cart.findOne({ userId }).populate('items.servicioId')
    
    if (!carritoActualizado) {
      return res.status(404).json({ message: 'Carrito no encontrado' })
    }

    // Si el carrito está vacío después de la eliminación, eliminar el documento del carrito
    if (carritoActualizado.items.length === 0) {
      await Cart.deleteOne({ userId })
      return res.json({ message: 'Servicio eliminado y carrito vacío eliminado.' })
    }

    res.json(carritoActualizado)
  } catch (err) {
    console.error('Error al eliminar del carrito:', err)
    res.status(500).json({ message: 'Error al eliminar del carrito' })
  }
}

// Actualizar cantidad en el carrito
const actualizarCantidad = async (req, res) => {
  try {
    const { servicioId } = req.params
    const { cantidad } = req.body
    const userId = req.user.id

    // Usar $set para actualizar la cantidad directamente en el array
    const carrito = await Cart.findOneAndUpdate(
      { 
        userId,
        'items.servicioId': new mongoose.Types.ObjectId(servicioId)
      },
      { 
        $set: { 'items.$.cantidad': cantidad }
      },
      { new: true }
    ).populate('items.servicioId')

    if (!carrito) {
      return res.status(404).json({ message: 'Carrito o servicio no encontrado' })
    }

    res.json(carrito)
  } catch (err) {
    console.error('Error al actualizar cantidad:', err)
    res.status(500).json({ message: 'Error al actualizar cantidad' })
  }
}

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  eliminarDelCarrito,
  actualizarCantidad
}

