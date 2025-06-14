const Technology = require('../models/Technology');
const fs = require('fs');
const path = require('path');

// Obtener todas las tecnologías
exports.getAllTechnologies = async (req, res) => {
    try {
        const technologies = await Technology.find().sort({ createdAt: -1 });
        res.json(technologies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener una tecnología por ID
exports.getTechnologyById = async (req, res) => {
    try {
        const technology = await Technology.findById(req.params.id);
        if (!technology) {
            return res.status(404).json({ message: 'Tecnología no encontrada' });
        }
        res.json(technology);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear una nueva tecnología
exports.createTechnology = async (req, res) => {
    try {
        const { name, description, price, categoria } = req.body;
        const image = req.file ? `/uploads/technologies/${req.file.filename}` : null;

        if (!image) {
            return res.status(400).json({ message: 'La imagen es requerida' });
        }

        const technology = new Technology({
            name,
            description,
            image,
            price,
            categoria
        });

        const savedTechnology = await technology.save();
        res.status(201).json(savedTechnology);
    } catch (error) {
        console.error('Error al crear tecnología:', error);
        res.status(400).json({ message: error.message });
    }
};

// Actualizar una tecnología
exports.updateTechnology = async (req, res) => {
    try {
        const { name, description, price, categoria } = req.body;
        const updateData = { name, description, price, categoria };

        if (req.file) {
            updateData.image = `/uploads/technologies/${req.file.filename}`;
            // Eliminar imagen anterior si existe
            const oldTechnology = await Technology.findById(req.params.id);
            if (oldTechnology && oldTechnology.image) {
                const oldImagePath = path.join(__dirname, '..', oldTechnology.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const technology = await Technology.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!technology) {
            return res.status(404).json({ message: 'Tecnología no encontrada' });
        }

        res.json(technology);
    } catch (error) {
        console.error('Error al actualizar tecnología:', error);
        res.status(400).json({ message: error.message });
    }
};

// Eliminar una tecnología
exports.deleteTechnology = async (req, res) => {
    try {
        const technology = await Technology.findById(req.params.id);
        
        if (!technology) {
            return res.status(404).json({ message: 'Tecnología no encontrada' });
        }

        // Eliminar imagen si existe
        if (technology.image) {
            const imagePath = path.join(__dirname, '..', technology.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Technology.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tecnología eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar tecnología:', error);
        res.status(500).json({ message: error.message });
    }
}; 