const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  email: { type: String, index: true },
  passwordHash: String,
  firebaseUid: { type: String, index: true },
  role: { type: String, enum: ['user','admin','staff','delivery'], default: 'user' },
  name: String,
  phone: String,
  fcmTokens: [String]
}, { timestamps: true })

UserSchema.methods.verifyPassword = function(password) {
  if (!this.passwordHash) return false
  return bcrypt.compareSync(password, this.passwordHash)
}

module.exports = mongoose.model('User', UserSchema)
