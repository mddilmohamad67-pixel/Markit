const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const User = require('../models/User')

// GET /api/users/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    // Try local JWT first
    const jwt = require('jsonwebtoken')
    const jwtSecret = process.env.ADMIN_JWT_SECRET || 'dev-secret'
    try {
      const payload = jwt.verify(token, jwtSecret)
      const user = await User.findById(payload.id).lean()
      return res.json({ authType: 'local', user })
    } catch (e) {
      // not local jwt, try firebase
    }

    const decoded = await admin.auth().verifyIdToken(token)
    const firebaseUid = decoded.uid
    const user = await User.findOne({ firebaseUid }).lean()
    return res.json({ authType: 'firebase', user: user || { firebaseUid, email: decoded.email } })
  } catch (err) {
    console.error('users/me error', err && err.message)
    return res.status(401).json({ error: 'Invalid token' })
  }
})

module.exports = router
