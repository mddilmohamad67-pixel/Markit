const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const Setting = require('../models/Setting')
const authorizeRole = require('../middleware/authorizeRole')

// multer for QR uploads
const upload = multer({ dest: path.join(__dirname,'..','..','uploads') })

// Get public settings
router.get('/public', async (req, res) => {
  const doc = await Setting.findOne({ key: 'payment_manual_qr' }).lean()
  res.json(doc ? doc.value : {})
})

// Admin get settings
router.get('/', authorizeRole('admin'), async (req, res) => {
  const doc = await Setting.findOne({ key: 'payment_manual_qr' }).lean()
  res.json(doc ? doc.value : {})
})

// Admin update settings (upiId and QR image)
router.post('/', authorizeRole('admin'), upload.single('qrImage'), async (req, res) => {
  try {
    const { upiId } = req.body
    const qrImageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.qrImageUrl || '')
    const value = { upiId, qrImageUrl }
    const doc = await Setting.findOneAndUpdate({ key: 'payment_manual_qr' }, { key: 'payment_manual_qr', value }, { upsert: true, new: true })
    res.json(doc.value)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
