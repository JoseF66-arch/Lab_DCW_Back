const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Verificar la conexión al iniciar
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error en la configuración del correo:', error)
  } else {
    console.log('✅ Servidor de correo listo para enviar mensajes')
  }
})

const enviarConsulta = async (req, res) => {
  console.log('➡️ Solicitud recibida para enviar consulta');
  console.log('Datos de la solicitud:', req.body);
  const { nombre, email, telefono, mensaje } = req.body

  if (!nombre || !email || !telefono || !mensaje) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' })
  }

  try {
    // Ruta a la plantilla HTML
    const templatePath = path.join(__dirname, '..', 'templates', 'consultationEmail.html')
    let emailHtml = fs.readFileSync(templatePath, 'utf8')

    // Reemplazar marcadores de posición con los datos del formulario
    emailHtml = emailHtml.replace('{{nombre}}', nombre)
    emailHtml = emailHtml.replace('{{email}}', email)
    emailHtml = emailHtml.replace('{{telefono}}', telefono)
    emailHtml = emailHtml.replace('{{mensaje}}', mensaje)

    // Configurar el correo
    const mailOptions = {
      from: `"${nombre} <${email}>" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Se envía al mismo correo configurado
      replyTo: email, // La respuesta irá al correo del usuario
      subject: `Nueva consulta de ${nombre}`,
      html: emailHtml // Usar el HTML de la plantilla
    }

    // Enviar el correo
    await transporter.sendMail(mailOptions)

    res.status(200).json({ message: 'Consulta enviada correctamente' })
  } catch (error) {
    console.error('Error al enviar la consulta:', error)
    res.status(500).json({ 
      message: 'Error al enviar la consulta',
      error: error.message 
    })
  }
}

module.exports = {
  enviarConsulta
} 