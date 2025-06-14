const mongoose = require('mongoose');
const Technology = require('../models/Technology');
require('dotenv').config({ path: '../.env' }); // Asegúrate de que la ruta a .env sea correcta

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Conectado...');
    } catch (err) {
        console.error('Error al conectar a MongoDB:', err.message);
        process.exit(1);
    }
};

const migrateTechnologyImagePaths = async () => {
    await connectDB();

    try {
        console.log('Iniciando migración de rutas de imágenes de tecnología...');
        const technologies = await Technology.find({});
        let updatedCount = 0;

        for (let tech of technologies) {
            // Verifica si la ruta de la imagen no empieza con '/uploads/technologies/'
            // y si no es nula o vacía
            if (tech.image && !tech.image.startsWith('/uploads/technologies/')) {
                const filename = tech.image.split('/').pop(); // Obtiene solo el nombre del archivo
                const newImagePath = `/uploads/technologies/${filename}`;
                
                if (tech.image !== newImagePath) {
                    tech.image = newImagePath;
                    await tech.save();
                    console.log(`Ruta de imagen actualizada para ${tech.name}: ${newImagePath}`);
                    updatedCount++;
                }
            }
        }
        console.log(`Migración completada. Se actualizaron ${updatedCount} tecnologías.`);
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        mongoose.disconnect();
    }
};

migrateTechnologyImagePaths(); 