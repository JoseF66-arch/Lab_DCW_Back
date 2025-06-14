require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db') // mejor separar conexión
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const cartRoutes = require('./routes/cartRoutes')
const adminRoutes = require('./routes/adminRoutes')
const serviceRoutes = require('./routes/serviceRoutes')
const consultationRoutes = require('./routes/consultationRoutes')
const technologyRoutes = require('./routes/technologyRoutes')
const orderRoutes = require('./routes/orderRoutes')

// Conectar a MongoDB
connectDB()

// Inicializar app
const app = express()

// Middlewares globales
app.use(cors(
  {origin: ["https://tilinazos.netlify.app", "http://localhost:5000"]}
))
app.use(express.json())

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/usuarios', userRoutes)
app.use('/api/carrito', cartRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/servicios', serviceRoutes)
app.use('/api/consultas', consultationRoutes)
app.use('/api/tecnologias', technologyRoutes)
app.use('/api/ordenes', orderRoutes)

// Ruta raíz
app.get('/', (req, res) => res.send('🌐 API funcionando correctamente'))

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  })
})

// Servidor
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
