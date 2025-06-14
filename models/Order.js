const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    servicio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precioUnitario: {
      type: Number,
      required: true
    },
    tecnologiasSeleccionadas: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technology'
    }]
  }],
  subtotal: {
    type: Number,
    required: true
  },
  impuestos: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  fechaCompra: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema); 