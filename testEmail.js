require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'Prueba de correo',
  text: '¡Funciona!'
}, (err, info) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Correo enviado:', info.response);
  }
}); 