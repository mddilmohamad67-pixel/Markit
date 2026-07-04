// apps/api/index.js (updated)
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Product = require('./models/Product')
const admin = require('firebase-admin')

const app = express()
app.use(cors())
app.use(express.json())

// Initialize firebase-admin if not already initialized (same approach as middleware)
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : null
    admin.initializeApp({
      credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
    })
  } catch (err) {
    console.warn('Firebase admin initialization skipped or failed:', err && err.message)
  }
}

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Public products
app.get('/api/products', async (req, res) => {
  const products = await Product.find().limit(500).lean()
  res.json(products)
})

// Admin create (protected or bypass in dev)
app.post('/api/products', async (req, res) => {
  // If DISABLE_AUTH=true allow in dev without auth
  if (process.env.DISABLE_AUTH !== 'true') {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'No token' })
    try {
      const decoded = await admin.auth().verifyIdToken(token)
      req.user = { uid: decoded.uid, email: decoded.email, phone: decoded.phone_number }
    } catch (err) {
      console.error('Firebase token verification failed', err && err.message)
      return res.status(401).json({ error: 'Invalid token' })
    }
  }

  const body = req.body
  try {
    const p = await Product.create(body)
    res.json(p)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Connect DB and start
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/markit'
mongoose.connect(MONGO).then(() => {
  console.log('Mongo connected')
  const port = process.env.PORT || 4000
  app.listen(port, () => console.log('API running on', port))
}).catch(err => {
  console.error('Mongo connection error', err)
})
