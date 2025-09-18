import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  images: [String],
  description: String,
  rating: Number,
  reviews: Number,
  cuisine: String,
  priceRange: String,
  deliveryTime: String,
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
