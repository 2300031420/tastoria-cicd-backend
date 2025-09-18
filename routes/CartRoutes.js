import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

// ✅ Get cart by email
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const cart = await Cart.findOne({ email }); // look up by email
    if (!cart) return res.json([]);
    res.json(cart.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create / replace entire cart (overwrite items)
router.post("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { items } = req.body;

    let cart = await Cart.findOne({ email });
    if (cart) {
      cart.items = items; // overwrite
    } else {
      cart = new Cart({ email, items });
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add multiple items (merge instead of overwrite)
// Add multiple items (merge, with restaurant ID)
router.post("/:email/add-multiple", async (req, res) => {
  try {
    const { email } = req.params;
    const { items } = req.body; // Array of { itemId, name, price, quantity, restaurant }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    let cart = await Cart.findOne({ email });

    if (!cart) {
      cart = new Cart({ email, items });
    } else {
      items.forEach((newItem) => {
        if (!newItem.restaurant) {
          throw new Error("Restaurant ID is required for each item");
        }

        const existingItem = cart.items.find(
          (item) => item.itemId.toString() === newItem.itemId
        );

        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          cart.items.push(newItem); // store restaurant id along with other fields
        }
      });
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});


// ✅ Clear cart
router.delete("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    await Cart.findOneAndDelete({ email });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
