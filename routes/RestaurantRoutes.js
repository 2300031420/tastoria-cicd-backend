import express from 'express';
import { getRestaurants , addRestaurant ,updateRestaurant,deleteRestaurant, uploadRestaurantImage } from '../controller/restaurantController.js';
import multer from "multer";
const router = express.Router();
const upload = multer({ dest: "uploads/" });
router.get('/', getRestaurants);
router.post('/' , addRestaurant);
router.put('/:id', updateRestaurant); 
router.delete('/:id', deleteRestaurant);
router.post('/upload-image', upload.single('file'), uploadRestaurantImage);

export default router;
