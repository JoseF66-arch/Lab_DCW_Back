const verificarAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' })
  }
}

module.exports = { verificarAdmin }
