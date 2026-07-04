const jwt = require('jsonwebtoken')
const admin = require('firebase-admin')
const User = require('../models/User')

// authorizeRole(role) middleware: allows either local JWT auth or Firebase token + role lookup
module.exports = function authorizeRole(requiredRole) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    const jwtSecret = process.env.ADMIN_JWT_SECRET || 'dev-secret'

    // Try local JWT first
    if (token) {
      try {
        const payload = jwt.verify(token, jwtSecret)
        if (payload && payload.role && payload.role === requiredRole) {
          req.user = { id: payload.id, email: payload.email, role: payload.role }
          return next()
        }
      } catch (err) {
        // not a valid local JWT, continue to try firebase
      }
    }

    // Try Firebase token
    if (!token) return res.status(401).json({ error: 'No token' })
    try {
      const decoded = await admin.auth().verifyIdToken(token)
      const firebaseUid = decoded.uid
      const user = await User.findOne({ firebaseUid }).lean()
      if (user && user.role === requiredRole) {
        req.user = { id: user._id, email: user.email, role: user.role, firebaseUid }
        return next()
      }
      return res.status(403).json({ error: 'Forbidden: insufficient role' })
    } catch (err) {
      console.error('authorizeRole firebase verify failed', err && err.message)
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}
