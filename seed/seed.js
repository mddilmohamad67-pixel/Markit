// seed/seed.js - simple node script to add sample products
const mongoose = require('mongoose')
const Product = require('../apps/api/models/Product')

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/markit'

async function run() {
  await mongoose.connect(MONGO)
  console.log('Connected')
  await Product.deleteMany({})
  const sample = [
    { title: 'Basmati Rice 5kg', slug: 'basmati-rice-5kg', price: 499, mrp: 599, stockQty: 50, description: 'Premium basmati rice' },
    { title: 'Atta 10kg', slug: 'atta-10kg', price: 399, mrp: 449, stockQty: 60, description: 'Whole wheat atta' },
  ]
  await Product.insertMany(sample)
  console.log('Seeded', sample.length)
  process.exit(0)
}
run().catch(err => { console.error(err); process.exit(1) })
