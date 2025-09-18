import Restaurant from '../models/Restaurant.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.json({ success: true, restaurants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurants' });
  }
};  
export const addRestaurant = async (req, res) => {
  try {
    // Accept direct image URL(s) for now
        const imagesArray = Array.isArray(req.body.images)
      ? req.body.images
      : req.body.image
        ? [req.body.image]
        : [];

    const { name, description, rating, reviews, cuisine, priceRange, deliveryTime } = req.body;

    const newRestaurant = new Restaurant({
      name,
      images: imagesArray,
      description,
      rating,
      reviews,
      cuisine,
      priceRange,
      deliveryTime,
    });

    await newRestaurant.save();

    res.status(201).json({ success: true, restaurant: newRestaurant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add restaurant' });
  }
};
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      req.body,
      { new: true } // return updated doc
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.json({ success: true, restaurant: updatedRestaurant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update restaurant' });
  }
};
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Restaurant.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete restaurant' });
  }
};
export const uploadRestaurantImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'restaurants' });
     fs.unlinkSync(req.file.path);
    res.json({ success: true, imageUrl: result.secure_url });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
};
