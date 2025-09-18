// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getOrders,
  getOrdersByRestaurant,
  updateOrderStatus
} from "../controller/OrdersController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/restaurant/:restaurant", getOrdersByRestaurant);
router.patch("/:id/status", updateOrderStatus);

export default router;
