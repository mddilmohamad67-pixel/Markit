const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Admin login (local credential)
// POST /api/admin/login { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    if (!user.verifyPassword(password)) return res.status(401).json({ error: 'Invalid credentials' })
    const jwtSecret = process.env.ADMIN_JWT_SECRET || 'dev-secret'
    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, jwtSecret, { expiresIn: '8h' })
    res.json({ token })
  } catch (err) {
    console.error('admin login error', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
