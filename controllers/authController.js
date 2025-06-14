const User = require('../models/User')
const generarToken = require('../utils/generarToken')
const nodemailer = require('nodemailer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Verificar la conexión al iniciar (opcional para authController, ya está en consultationController)
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error en la configuración del correo (authController):', error)
  } else {
    console.log('✅ Servidor de correo listo para enviar mensajes (authController)')
  }
})

const registrarUsuario = async (req, res) => {
  const { nombre, email, password, rol } = req.body

  if (!nombre || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' })
  }

  try {
    const existe = await User.findOne({ email })
    if (existe) {
      return res.status(400).json({ message: 'El correo ya está registrado.' })
    }

    // 🧪 Debug opcional
    console.log('🔐 Usuario autenticado:', req.user)
    console.log('📝 Rol solicitado:', rol)

    // Solo admins autenticados pueden asignar rol 'admin'
    let rolFinal = 'cliente'
    if (req.user?.rol === 'admin' && ['admin', 'cliente'].includes(rol)) {
      rolFinal = rol
    }

    console.log('✅ Rol final:', rolFinal)

    const user = await User.create({ nombre, email, password, rol: rolFinal })

    res.status(201).json({
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      token: generarToken(user)
    })
  } catch (err) {
    console.error('❌ Error al registrar usuario:', err)
    res.status(500).json({ message: 'Error al registrar usuario.' })
  }
}

const loginUsuario = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' })
  }

  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.compararPassword(password))) {
      return res.status(401).json({ message: 'Credenciales inválidas.' })
    }

    res.json({
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      token: generarToken(user)
    })
  } catch (err) {
    console.error('❌ Error en login:', err)
    res.status(500).json({ message: 'Error al iniciar sesión.' })
  }
}

// @desc    Solicitar restablecimiento de contraseña
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Por favor, ingresa tu correo electrónico.' })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      // Para evitar enumeración de usuarios, siempre se envía un mensaje de éxito
      return res.status(200).json({ message: 'Si tu correo está registrado, recibirás un código de verificación.' })
    }

    const resetCode = user.getResetPasswordCode()
    await user.save({ validateBeforeSave: false }) // Guardar el código hasheado y la expiración

    // Cargar la plantilla de correo
    const templatePath = path.join(__dirname, '..', 'templates', 'resetPasswordEmail.html')
    let emailHtml = fs.readFileSync(templatePath, 'utf8')

    emailHtml = emailHtml.replace('{{nombre}}', user.nombre)
    emailHtml = emailHtml.replace('{{resetCode}}', resetCode)

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Tu código de verificación para restablecer contraseña',
      html: emailHtml
    }

    await transporter.sendMail(mailOptions)

    res.status(200).json({ message: 'Código de verificación enviado al correo electrónico.' })
  } catch (err) {
    console.error('❌ Error en forgotPassword:', err)
    res.status(500).json({ message: 'Error al solicitar restablecimiento de contraseña.' })
  }
}

// @desc    Restablecer contraseña usando código y correo
// @route   PUT /api/auth/resetpassword
// @access  Public
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Por favor, ingresa tu correo, el código y tu nueva contraseña.' })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado.' })
    }

    // Hashear el código recibido para comparar con el hasheado en la DB
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex')

    if (user.resetPasswordToken !== hashedCode || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: 'Código inválido o expirado.' })
    }

    user.password = newPassword
    user.resetPasswordToken = undefined // Limpiar token/código
    user.resetPasswordExpire = undefined // Limpiar expiración
    await user.save()

    res.status(200).json({ message: 'Contraseña restablecida correctamente.' })
  } catch (err) {
    console.error('❌ Error en resetPassword:', err)
    res.status(500).json({ message: 'Error al restablecer contraseña.' })
  }
}

module.exports = {
  registrarUsuario,
  loginUsuario,
  forgotPassword,
  resetPassword
}
