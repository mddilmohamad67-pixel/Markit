const mongoose = require('mongoose')

const VariantSchema = new mongoose.Schema({
  sku: String,
  attributes: { type: Map, of: String },
  price: Number,
  mrp: Number,
  stockQty: Number,
})

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  brand: String,
  categories: [String],
  images: [String],
  videoUrl: String,
  sku: String,
  barcode: String,
  mrp: Number,
  price: Number,
  discountPercent: Number,
  stockQty: Number,
  weight: String,
  variants: [VariantSchema],
  deliveryTimeEstimate: String,
  returnPolicy: String,
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isPublished: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Product', ProductSchema)
