// controllers/orderController.js
import Order from "../models/Orders.js";
import Menu from "../models/Menu.js";
import { nanoid } from "nanoid";

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { customerName, phone, address, items, restaurant, estimatedTime } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;
    const populatedItems = [];

    for (const i of items) {
      const menuItem = await Menu.findById(i.itemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Item not found: ${i.itemId}` });
      }

      populatedItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        quantity: i.quantity,
        price: menuItem.price,
      });

      total += menuItem.price * i.quantity;
    }

    const newOrder = new Order({
      orderNumber: nanoid(8), // unique order number
      customerName,
      phone,
      address: address || "",
      restaurant,
      items: populatedItems,
      total,
      status: "Pending",
      estimatedTime: estimatedTime || 0,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

// Get orders by restaurant slug
export const getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurant } = req.params;
    const orders = await Order.find({ restaurant }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching restaurant orders", error: err.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, restaurant } = req.body;

    const validStatuses = ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Ensure order belongs to the restaurant making the request
    const order = await Order.findOne({ _id: id, restaurant });
    if (!order) {
      return res.status(404).json({ message: "Order not found for this restaurant" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order", error: err.message });
  }
};

