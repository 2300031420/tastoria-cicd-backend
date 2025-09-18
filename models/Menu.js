import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  restaurant: {
    type: String,  
    required: [true, 'Restaurant ID is required'],
  },
  name: { 
    type: String, 
    required: [true, 'Menu item name is required'],
    trim: true 
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  detailedDescription: {
    type: String,
    trim: true,
    default: ""
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ["Starters", "Main Course", "Desserts", "Beverages", "Snacks"],
      message: 'Category must be one of: Starters, Main Course, Desserts, Beverages, Snacks'
    }
  },
  image: {
    type: String,
    default: ""
  },
  ingredients: {
    type: [String],
    default: []
  },
  nutritionalInfo: {
    calories: { type: String, default: "" },
    protein: { type: String, default: "" },
    carbs: { type: String, default: "" },
    fat: { type: String, default: "" },
  },
  preparationTime: {
    type: String,
    default: ""
  },
  spicyLevel: {
    type: String,
    default: ""
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  allergens: {
    type: [String],
    default: []
  },
  servingSize: {
    type: String,
    default: ""
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  // Add some debugging
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a pre-save middleware for debugging
menuSchema.pre('save', function(next) {
  console.log('Saving menu item:', this.name, 'for restaurant:', this.restaurant);
  next();
});

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;