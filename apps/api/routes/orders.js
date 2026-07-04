const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const Order = require('../models/Order')
const Setting = require('../models/Setting')
const authorizeRole = require('../middleware/authorizeRole')

// multer config
const upload = multer({ dest: path.join(__dirname,'..','..','uploads') })

// Create order
router.post('/', async (req, res) => {
  try {
    const { items, total, address, paymentMethod } = req.body
    // create order; payment details for manual_qr are set from settings
    const settingsDoc = await Setting.findOne({ key: 'payment_manual_qr' }).lean()
    const paymentDefaults = settingsDoc ? settingsDoc.value : {}
    const payment = {
      method: paymentMethod === 'cod' ? 'cod' : 'manual_qr',
      upiId: paymentMethod === 'cod' ? null : paymentDefaults.upiId,
      qrImageUrl: paymentMethod === 'cod' ? null : paymentDefaults.qrImageUrl,
      paymentStatus: paymentMethod === 'cod' ? 'cod' : 'not_paid'
    }

    const order = await Order.create({ items, total, address, payment, statusTimeline: [{ status: 'created', at: new Date() }], currentStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending_payment' })
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
    const fileUrl = `/uploads/${req.file.filename}`
    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    // only allow if payment method is manual_qr
    if (!order.payment || order.payment.method !== 'manual_qr') return res.status(400).json({ error: 'Invalid payment method for proof upload' })

    order.payment.proofImageUrl = fileUrl
    order.payment.utr = utr
    order.payment.paymentStatus = 'pending_verification'
    order.statusTimeline.push({ status: 'pending_verification', at: new Date() })
    order.currentStatus = 'pending_verification'
    await order.save()
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
    const { action } = req.body // 'approve' or 'reject'
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (!order.payment || order.payment.method !== 'manual_qr') return res.status(400).json({ error: 'Order not manual_qr' })
    if (order.payment.paymentStatus !== 'pending_verification') return res.status(400).json({ error: 'Payment not pending' })

    if (action === 'approve') {
      order.payment.paymentStatus = 'approved'
      order.statusTimeline.push({ status: 'payment_approved', at: new Date() })
      order.currentStatus = 'confirmed'
      // create a notification (simple approach)
      const Notification = require('../models/Notification')
      await Notification.create({ userId: order.userId, title: 'Payment Approved', body: `Your payment for order ${order._id} has been approved. Order confirmed.` })
    } else {
      order.payment.paymentStatus = 'rejected'
      order.statusTimeline.push({ status: 'payment_rejected', at: new Date() })
      order.currentStatus = 'payment_rejected'
      const Notification = require('../models/Notification')
      await Notification.create({ userId: order.userId, title: 'Payment Rejected', body: `Your payment for order ${order._id} was rejected. Please upload a valid proof or contact support.` })
    }

    await order.save()
    res.json({ ok: true, order })
  } catch (err) {
    console.error('verify error', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
