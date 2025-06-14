const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del servicio es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  costo: {
    type: Number,
    required: [true, 'El costo es obligatorio'],
    min: [0, 'El costo no puede ser negativo']
  },
  imagen: {
    type: String,
    required: [true, 'La imagen es obligatoria']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['pagina_web', 'aplicacion', 'mantenimiento', 'otros'],
    default: 'otros'
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Service', serviceSchema) 