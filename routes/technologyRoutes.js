const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Importa el módulo fs
const technologyController = require('../controllers/technologyController');

// Directorio de destino para las imágenes de tecnología
const uploadDir = path.join(__dirname, '..', 'uploads', 'technologies');

// Asegurarse de que el directorio de subida exista
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});

// Rutas para tecnologías
router.get('/', technologyController.getAllTechnologies);
router.get('/:id', technologyController.getTechnologyById);
router.post('/', upload.single('image'), technologyController.createTechnology);
router.put('/:id', upload.single('image'), technologyController.updateTechnology);
router.delete('/:id', technologyController.deleteTechnology);

module.exports = router; 