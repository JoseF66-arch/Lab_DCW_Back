const jwt = require('jsonwebtoken')

// 🔒 Middleware obligatorio: protege rutas privadas
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  console.log('[Middleware] Verificando token...', { token })

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    console.log('[Middleware] Token decodificado. req.user:', req.user)
    next()
  } catch (err) {
    console.error('[Middleware] Error al verificar token:', err.message)
    return res.status(403).json({ message: 'Token inválido o expirado' })
  }
}

// 🟣 Middleware opcional: no lanza error si no hay token
const verificarTokenOptional = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return next() // sin token, continuar

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
  } catch (err) {
    console.warn('Token opcional inválido:', err.message)
    // continuar sin req.user
  }

  next()
}

module.exports = {
  verificarToken,
  verificarTokenOptional
}
