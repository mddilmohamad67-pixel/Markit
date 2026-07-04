const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
  method: { type: String, enum: ['manual_qr','cod'], required: true },
  upiId: String,
  qrImageUrl: String,
  proofImageUrl: String,
  utr: String,
  paymentStatus: { type: String, enum: ['not_paid','pending_verification','approved','rejected','cod'], default: 'not_paid' }
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ productId: mongoose.Schema.Types.ObjectId, qty: Number, price: Number }],
  total: Number,
  address: String,
  payment: PaymentSchema,
  statusTimeline: [{ status: String, at: Date }],
  currentStatus: { type: String, default: 'created' },
}, { timestamps: true })

module.exports = mongoose.model('Order', OrderSchema)
