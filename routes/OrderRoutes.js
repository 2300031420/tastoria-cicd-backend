// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getOrders,
  getOrdersByRestaurant,
  updateOrderStatus,
  getAdminStats
} from "../controller/OrdersController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/restaurant/:restaurant", getOrdersByRestaurant);
router.patch("/:id/status", updateOrderStatus);
router.get("/stats", getAdminStats);

export default router;
