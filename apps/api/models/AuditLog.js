const mongoose = require('mongoose')

const AuditSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  meta: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

module.exports = mongoose.model('AuditLog', AuditSchema)
