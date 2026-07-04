const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const Order = require('../models/Order')
const Setting = require('../models/Setting')
const authorizeRole = require('../middleware/authorizeRole')
const admin = require('../firebaseAdmin')
const fs = require('fs')
const { notifyUser } = require('../utils/notify')
const AuditLog = require('../models/AuditLog')

// multer config (store locally then upload to Firebase Storage)
const upload = multer({ dest: path.join(__dirname,'..','..','uploads') })

async function uploadToFirebase(localPath, remotePath) {
  const bucket = admin.storage().bucket()
  await bucket.upload(localPath, { destination: remotePath })
  // make signed URL
  const file = bucket.file(remotePath)
  const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' })
  return url
}

// Create order
router.post('/', async (req, res) => {
  try {
    const { items, total, address, paymentMethod, userId } = req.body
    const settingsDoc = await Setting.findOne({ key: 'payment_manual_qr' }).lean()
    const paymentDefaults = settingsDoc ? settingsDoc.value : {}
    const payment = {
      method: paymentMethod === 'cod' ? 'cod' : 'manual_qr',
      upiId: paymentMethod === 'cod' ? null : paymentDefaults.upiId,
      qrImageUrl: paymentMethod === 'cod' ? null : paymentDefaults.qrImageUrl,
      paymentStatus: paymentMethod === 'cod' ? 'cod' : 'not_paid'
    }

    const order = await Order.create({ userId, items, total, address, payment, statusTimeline: [{ status: 'created', at: new Date() }], currentStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending_payment' })
    res.json(order)
  } catch (err) {
    console.error('create order error', err)
    res.status(500).json({ error: err.message })
  }
})

// Upload payment proof for manual QR payment
router.post('/:id/proof', upload.single('screenshot'), async (req, res) => {
  try {
    const { id } = req.params
    const { utr } = req.body
    if (!req.file) return res.status(400).json({ error: 'Screenshot required' })
    const localPath = req.file.path
    const remotePath = `orders/${id}/${req.file.filename}${path.extname(req.file.originalname)}`
    const fileUrl = await uploadToFirebase(localPath, remotePath)
    // delete local
    try { fs.unlinkSync(localPath) } catch (e) {}

    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (!order.payment || order.payment.method !== 'manual_qr') return res.status(400).json({ error: 'Invalid payment method for proof upload' })

    order.payment.proofImageUrl = fileUrl
    order.payment.utr = utr
    order.payment.paymentStatus = 'pending_verification'
    order.statusTimeline.push({ status: 'pending_verification', at: new Date() })
    order.currentStatus = 'pending_verification'
    await order.save()

    // Notify user (if any)
    if (order.userId) {
      await notifyUser(order.userId, 'Payment Submitted', `Your payment proof for order ${order._id} is submitted and pending verification.`)
    }

    res.json({ ok: true, order })
  } catch (err) {
    console.error('proof upload error', err)
    res.status(500).json({ error: err.message })
  }
})

// Get order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean()
    if (!order) return res.status(404).json({ error: 'Not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: list orders
router.get('/', authorizeRole('admin'), async (req, res) => {
  try {
    const q = req.query.q || ''
    const filter = q ? { _id: q } : {}
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean()
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: approve/reject payment
router.post('/:id/verify', authorizeRole('admin'), async (req, res) => {
  try {
    const adminId = req.user && req.user.id
    const { action } = req.body // 'approve' or 'reject'
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (!order.payment || order.payment.method !== 'manual_qr') return res.status(400).json({ error: 'Order not manual_qr' })
    if (order.payment.paymentStatus !== 'pending_verification') return res.status(400).json({ error: 'Payment not pending' })

    if (action === 'approve') {
      order.payment.paymentStatus = 'approved'
      order.statusTimeline.push({ status: 'payment_approved', at: new Date() })
      order.currentStatus = 'confirmed'
      await notifyUser(order.userId, 'Payment Approved', `Your payment for order ${order._id} has been approved. Order confirmed.`)
      await AuditLog.create({ adminId, action: 'approve_payment', meta: { orderId: order._id } })
    } else {
      order.payment.paymentStatus = 'rejected'
      order.statusTimeline.push({ status: 'payment_rejected', at: new Date() })
      order.currentStatus = 'payment_rejected'
      await notifyUser(order.userId, 'Payment Rejected', `Your payment for order ${order._id} was rejected. Please upload a valid proof or contact support.`)
      await AuditLog.create({ adminId, action: 'reject_payment', meta: { orderId: order._id } })
    }

    await order.save()
    res.json({ ok: true, order })
  } catch (err) {
    console.error('verify error', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
