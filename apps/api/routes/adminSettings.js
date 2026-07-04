const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const Setting = require('../models/Setting')
const authorizeRole = require('../middleware/authorizeRole')
const admin = require('../firebaseAdmin')
const fs = require('fs')
const AuditLog = require('../models/AuditLog')

// multer for QR uploads
const upload = multer({ dest: path.join(__dirname,'..','..','uploads') })

async function uploadToFirebase(localPath, remotePath) {
  const bucket = admin.storage().bucket()
  await bucket.upload(localPath, { destination: remotePath })
  const file = bucket.file(remotePath)
  const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' })
  return url
}

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
    const adminId = req.user && req.user.id
    const { upiId } = req.body
    let qrImageUrl = req.body.qrImageUrl || ''
    if (req.file) {
      const localPath = req.file.path
      const remotePath = `settings/qr/${req.file.filename}${path.extname(req.file.originalname)}`
      qrImageUrl = await uploadToFirebase(localPath, remotePath)
      try { fs.unlinkSync(localPath) } catch (e) {}
    }
    const value = { upiId, qrImageUrl }
    const doc = await Setting.findOneAndUpdate({ key: 'payment_manual_qr' }, { key: 'payment_manual_qr', value }, { upsert: true, new: true })
    await AuditLog.create({ adminId, action: 'update_qr_settings', meta: { upiId, qrImageUrl } })
    res.json(doc.value)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
