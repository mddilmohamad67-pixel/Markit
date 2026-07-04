const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Product = require('./models/Product')
const verifyFirebase = require('./middleware/verifyFirebase')

const app = express()
app.use(cors())
app.use(express.json())

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Public products
app.get('/api/products', async (req, res) => {
  const products = await Product.find().limit(50).lean()
  res.json(products)
})

// Admin create (protected)
app.post('/api/products', verifyFirebase, async (req, res) => {
  // Very simple check: ensure user field exists on req.user
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
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
