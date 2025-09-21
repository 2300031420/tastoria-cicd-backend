import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import restaurantRoutes from "./routes/RestaurantRoutes.js";
import menuRoutes from "./routes/MenuRoutes.js"
import orderRoutes from "./routes/OrderRoutes.js"
import cartRoutes from "./routes/CartRoutes.js";
dotenv.config();
const app = express();



// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://tastoriahotels.netlify.app" , "https://tastoria-cicd.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders',orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", orderRoutes);
// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
