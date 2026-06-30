const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'official-vehicle-jwt-secret-key-2026'

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录或token已过期' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: '未登录或token已过期' })
  }
}

module.exports = { authMiddleware, JWT_SECRET }
