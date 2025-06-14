const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Crear una nueva orden desde el carrito
exports.createOrder = async (req, res) => {
  try {
    console.log('Iniciando proceso de creación de orden...');
    const userId = req.user.id;
    console.log('ID del usuario:', userId);

    // Obtener el carrito del usuario
    console.log('Buscando carrito del usuario...');
    const cart = await Cart.findOne({ userId: userId }).populate({
      path: 'items.servicioId',
      model: 'Service'
    }).populate({
      path: 'items.tecnologiasSeleccionadas',
      model: 'Technology'
    });

    console.log('Carrito encontrado:', cart);

    if (!cart || cart.items.length === 0) {
      console.log('Carrito vacío o no encontrado');
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    // Calcular totales
    const subtotal = cart.items.reduce((total, item) => total + (item.precioTotal * item.cantidad), 0);
    const impuestos = subtotal * 0.13;
    const total = subtotal + impuestos;

    console.log('Totales calculados:', { subtotal, impuestos, total });

    // Crear la orden
    console.log('Creando nueva orden...');
    const orderData = {
      usuario: userId,
      items: cart.items.map(item => {
        console.log('Procesando item:', item);
        return {
          servicio: item.servicioId._id,
          cantidad: item.cantidad,
          precioUnitario: item.precioTotal,
          tecnologiasSeleccionadas: item.tecnologiasSeleccionadas ? item.tecnologiasSeleccionadas.map(tech => tech._id) : []
        };
      }),
      subtotal,
      impuestos,
      total
    };

    console.log('Datos de la orden a crear:', orderData);

    const order = new Order(orderData);
    console.log('Orden creada, guardando...');
    await order.save();
    console.log('Orden guardada exitosamente');

    // Limpiar el carrito
    console.log('Limpiando carrito...');
    cart.items = [];
    await cart.save();
    console.log('Carrito limpiado exitosamente');

    res.status(201).json({
      message: 'Orden creada exitosamente',
      order
    });
  } catch (error) {
    console.error('Error detallado al crear la orden:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error al procesar la orden',
      error: error.message 
    });
  }
};

// Obtener todas las órdenes del usuario
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ usuario: userId })
      .populate({
        path: 'items.servicio',
        model: 'Service'
      })
      .populate({
        path: 'items.tecnologiasSeleccionadas',
        model: 'Technology'
      })
      .sort({ fechaCompra: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes' });
  }
};

// Obtener una orden específica
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.servicio',
        model: 'Service'
      })
      .populate({
        path: 'items.tecnologiasSeleccionadas',
        model: 'Technology'
      });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Verificar que la orden pertenece al usuario
    if (order.usuario.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error al obtener la orden:', error);
    res.status(500).json({ message: 'Error al obtener la orden' });
  }
}; 