import express from 'express';
import { getMenuByRestaurant, addMenuItem, uploadMenuImage, deleteMenuItem, updateMenuItem, upload ,getSalesData, getTrendingItems} from '../controller/MenuController.js';

const router = express.Router();

// Image upload route
router.post("/upload-image", upload.single("file"), uploadMenuImage);
router.get("/sales", getSalesData);
router.get("/trending", getTrendingItems);
// Menu CRUD routes - Fixed to match frontend calls
router.get("/:restaurantId", getMenuByRestaurant);           // GET /api/menu/:restaurantId
router.post("/:restaurantId", addMenuItem);                  // POST /api/menu/:restaurantId (matches frontend)
router.put("/:restaurantId/:id", updateMenuItem);            // PUT /api/menu/:restaurantId/:id (matches frontend)
router.delete("/:restaurantId/:id", deleteMenuItem);         // DELETE /api/menu/:restaurantId/:id

// Keep the old routes for backward compatibility if needed
router.post("/add", addMenuItem);                           // POST /api/menu/add (legacy)
router.put("/:id", updateMenuItem);                         // PUT /api/menu/:id (legacy)

export default router;