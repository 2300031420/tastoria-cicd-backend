import Menu from "../models/Menu.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

// Multer setup (buffer storage)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/**
 * Upload menu image to Cloudinary
 */
export const uploadMenuImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const buffer = req.file.buffer;

    // Wrap cloudinary uploader in a Promise
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "menu_images" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await uploadToCloudinary();
    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};

/**
 * Get all menu items by restaurant
 */
export const getMenuByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  try {
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const menuItems = await Menu.find({ restaurant: restaurantId });

    res.json({ menu: menuItems });
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};

/**
 * Add new menu item
 */
export const addMenuItem = async (req, res) => {
  try {
    console.log("Received menu item data:", req.body); // Debug log

    // Validate required fields
    const { name, description, price, category, restaurant } = req.body;
    
    if (!name || !description || !price || !category || !restaurant) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["name", "description", "price", "category", "restaurant"],
        received: Object.keys(req.body)
      });
    }

    // Create menu item with validated data
    const menuItemData = {
      restaurant,
      name,
      description,
      price: Number(price),
      category,
      detailedDescription: req.body.detailedDescription || "",
      image: req.body.image || "",
      ingredients: Array.isArray(req.body.ingredients) ? req.body.ingredients : [],
      nutritionalInfo: req.body.nutritionalInfo || { calories: "", protein: "", carbs: "", fat: "" },
      allergens: Array.isArray(req.body.allergens) ? req.body.allergens : [],
      isVegetarian: Boolean(req.body.isVegetarian),
      preparationTime: req.body.preparationTime || "",
      rating: Number(req.body.rating) || 0,
      spicyLevel: req.body.spicyLevel || "",
      servingSize: req.body.servingSize || "",
      isAvailable: req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : true,
    };

    const newItem = new Menu(menuItemData);
    await newItem.save();
    
    console.log("Successfully created menu item:", newItem._id); // Debug log
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding menu item:", error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to add menu item",
      error: error.message
    });
  }
};

/**
 * Update a menu item
 */
export const updateMenuItem = async (req, res) => {
  const { id, restaurantId } = req.params; // Get both id and restaurantId from params
  try {
    if (!id) {
      return res.status(400).json({ message: "Menu item ID is required" });
    }

    console.log("Updating menu item:", { id, restaurantId }); // Debug log

    // Validate and clean the update data
    const updateData = { ...req.body };
    
    // Ensure restaurant field is set correctly
    if (restaurantId) {
      updateData.restaurant = restaurantId;
    }
    
    if (updateData.price) {
      updateData.price = Number(updateData.price);
    }
    
    if (updateData.rating) {
      updateData.rating = Number(updateData.rating);
    }

    // Update only the item that belongs to the specific restaurant
    const query = restaurantId ? { _id: id, restaurant: restaurantId } : { _id: id };
    const updated = await Menu.findOneAndUpdate(query, updateData, { 
      new: true,
      runValidators: true // This ensures schema validations run on update
    });
    
    if (!updated) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating menu item:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to update menu item",
      error: error.message
    });
  }
};

/**
 * Delete a menu item
 */
export const deleteMenuItem = async (req, res) => {
  const { restaurantId, id } = req.params;
  try {
    if (!id || !restaurantId) {
      return res.status(400).json({ message: "Menu item ID and restaurant ID are required" });
    }

    const deleted = await Menu.findOneAndDelete({ _id: id, restaurant: restaurantId });
    
    if (!deleted) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ 
      message: "Failed to delete menu item",
      error: error.message
    });
  }
};
export const getSalesData = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format to { date, revenue, orders }
    const formatted = sales.map(s => ({
      date: s._id,
      revenue: s.revenue,
      orders: s.orders
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Sales data error:", err);
    res.status(500).json({ error: "Failed to fetch sales data" });
  }
};

export const getTrendingItems = async(req ,res)=>{
         try{
          const trending = await Order.Aggregate([
            {$unwind:"$items"},
            {
              $group:{
                _id:"$items.itemId",
                totalSold:{$sum:"items.quantity"}
              }
            },
            {$sort:{totalSold:-1}},
            {$limit: 10},
           {
        $lookup: {
          from: "menus", // Menu collection
          localField: "_id",
          foreignField: "_id",
          as: "menuItem"
        }
      },
      { $unwind: "$menuItem" },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          name: "$menuItem.name",
          category: "$menuItem.category",
          price: "$menuItem.price",
          image: "$menuItem.image"
        }
      }
    ]);

    res.json(trending);
  } catch (err) {
    console.error("Trending items error:", err);
    res.status(500).json({ error: "Failed to fetch trending items" });
  }
};