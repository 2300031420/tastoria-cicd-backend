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


// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({
      status: { $in: ["Pending", "Preparing", "Ready"] },
    });
    const deliveredOrders = await Order.find({ status: "Delivered" });
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = deliveredOrders.length ? totalRevenue / deliveredOrders.length : 0;
    const menuItems = await Menu.countDocuments();
    const customerPhones = await Order.distinct("phone");
    const totalCustomers = customerPhones.length;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyOrders = await Order.countDocuments({ createdAt: { $gte: startOfDay } });

    res.json({
      totalOrders,
      activeOrders,
      totalRevenue,
      menuItems,
      totalCustomers,
      avgOrderValue: Math.round(avgOrderValue),
      dailyOrders,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
};
// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order", error: err.message });
  }
};
