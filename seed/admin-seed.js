const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../apps/api/models/User')

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/markit'
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@markit.local'
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'admin123'

async function run() {
  await mongoose.connect(MONGO)
  console.log('Connected to', MONGO)
  const existing = await User.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    console.log('Admin user already exists:', ADMIN_EMAIL)
    process.exit(0)
  }
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
  const adminUser = await User.create({ email: ADMIN_EMAIL, passwordHash: hash, role: 'admin', name: 'Markit Admin' })
  console.log('Created admin user:', ADMIN_EMAIL)
  console.log('Use POST /api/admin/login to obtain a token with this credential')
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
