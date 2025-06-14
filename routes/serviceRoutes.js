const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const {
  obtenerServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  eliminarServicio
} = require('../controllers/serviceController')
const { verificarToken } = require('../middleware/authMiddleware')
const { verificarAdmin } = require('../middleware/verificarAdmin')

// Asegurar que el directorio de uploads existe
const uploadDir = path.join(__dirname, '..', 'uploads', 'servicios')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'))
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken)

// Rutas públicas (solo requieren autenticación)
router.get('/', obtenerServicios)
router.get('/:id', obtenerServicio)

// Rutas protegidas (requieren rol de admin)
router.use(verificarAdmin)
router.post('/', upload.single('imagen'), crearServicio)
router.put('/:id', upload.single('imagen'), actualizarServicio)
router.delete('/:id', eliminarServicio)

module.exports = router 