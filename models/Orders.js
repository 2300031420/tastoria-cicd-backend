import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: false },
  address: { type: String, required: false },
  restaurant: { type: String, required: true }, // slug
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
      name: { type: String }, // optional, for frontend display
      price: { type: Number }, // optional, for frontend display
      quantity: { type: Number, required: true },
    }
  ],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"], 
    default: "Pending" 
  },
  estimatedTime: { type: Number, default: 0 } // in minutes
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
