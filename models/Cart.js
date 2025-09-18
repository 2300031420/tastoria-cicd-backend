import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  restaurant: { type: String, required: true } // restaurant id
});

const CartSchema = new mongoose.Schema({
   email: { type: String, required: true, unique: true },
  items: [CartItemSchema]
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
