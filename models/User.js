const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto') // Para generar tokens de recuperación

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio']
  },
  email: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['cliente', 'admin'],
    default: 'cliente'
  },
  resetPasswordToken: String, // Campo para el token de recuperación (ahora será el código hasheado)
  resetPasswordExpire: Date // Campo para la fecha de expiración del token
}, {
  timestamps: true
})

// Encripta la contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

// Método para comparar contraseñas
userSchema.methods.compararPassword = function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password)
}

// Método para generar un código de recuperación de contraseña (numérico)
userSchema.methods.getResetPasswordCode = function () {
  // Generar un código numérico de 6 dígitos
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

  // Hashear el código y guardarlo en resetPasswordToken
  // Usamos SHA256 para hashear el código, como se haría con una contraseña
  this.resetPasswordToken = crypto.createHash('sha256').update(resetCode).digest('hex')

  // Establecer expiración del código (ej. 10 minutos)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  return resetCode // Devolvemos el código sin hashear para enviarlo al usuario
}

module.exports = mongoose.model('User', userSchema)
