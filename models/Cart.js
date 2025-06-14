const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    servicioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    tecnologiasSeleccionadas: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technology'
    }],
    precioTotal: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('Cart', cartSchema)
