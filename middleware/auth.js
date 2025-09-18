import jwt from "jsonwebtoken";
import User from "../models/user.js";


export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded token payload
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

