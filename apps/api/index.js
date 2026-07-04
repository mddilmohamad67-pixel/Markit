const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const Product = require('./models/Product')
const adminRoutes = require('./routes/admin')
const usersRoutes = require('./routes/users')
const ordersRoutes = require('./routes/orders')
const settingsRoutes = require('./routes/adminSettings')
const authorizeRole = require('./middleware/authorizeRole')
const admin = require('firebase-admin')

const app = express()
app.use(cors())
app.use(express.json())

// serve uploads
app.use('/uploads', express.static(path.join(__dirname,'..','..','uploads')))

// Initialize firebase-admin if not already initialized
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

app.use('/api/admin', adminRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/settings/payment', settingsRoutes)

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Public products
app.get('/api/products', async (req, res) => {
  const products = await Product.find().limit(500).lean()
  res.json(products)
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
