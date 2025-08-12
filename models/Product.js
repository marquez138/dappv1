import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'user' },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  date: { type: Number, required: true },
  designTemplates: { type: Object, default: {} }, // Added this line
  availableColors: { type: Array, default: [] }, // Added this line
})

const Product =
  mongoose.models.product || mongoose.model('product', productSchema)

export default Product
