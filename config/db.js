const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.error('❌ MONGO_URI no está definida en .env')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('✅ Conectado a MongoDB Atlas')
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB
