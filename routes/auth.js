import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import crypto from "crypto";
import transporter from "../config/nodemailer.js";
const router = express.Router();
const otpStore = {};
const storage = multer.memoryStorage(); // store file in memory
const upload = multer({ storage });
// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP and user data in memory
    otpStore[email] = {
      otp,
      otpExpires,
      userData: { name, email, password: passwordHash },
    };

    // Send OTP via email
    await transporter.sendMail({
      from: `"Tastoria" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Tastoria Signup",
      html: `<p>Hello ${name},</p>
             <p>Your OTP is: <b>${otp}</b></p>
             <p>This OTP will expire in 10 minutes.</p>`,
    });

    res.status(200).json({
      message: "OTP sent successfully. Please check your email to verify.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const record = otpStore[email];
    if (!record) return res.status(404).json({ message: "OTP not found" });

    if (record.otp !== otp || record.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP is invalid or expired" });

    // Create user
    const { name, password } = record.userData;
    const user = new User({
      name,
      email,
      password,
      isVerified: true, // already verified
    });

    await user.save();

    // Remove from OTP store
    delete otpStore[email];

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



router.post("/google-signin", async (req, res) => {
  try {
    const { name, email, firebaseUid } = req.body;

    if (!name || !email || !firebaseUid) {
      return res.status(400).json({ message: "Invalid data from Google" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        firebaseUid,
        role: "customer",
        isVerified: true, // mark verified
      });
      await user.save();
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Google sign-in successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token, // ✅ send token to frontend
    });
  } catch (error) {
    console.error("Google Sign-in error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/profile", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password, phoneNumber } = req.body;

    if (name) user.name = name;
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: "Email already in use" });
      user.email = email;
    }
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (password) user.password = await bcrypt.hash(password, 10);

    if (req.file) {
      const streamUpload = (reqFile) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "profile_images" },
            (error, result) => (result ? resolve(result) : reject(error))
          );
          streamifier.createReadStream(reqFile.buffer).pipe(stream);
        });

      const result = await streamUpload(req.file);
      user.profileImage = result.secure_url;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImage: user.profileImage,
        addresses: user.addresses || [],
        preferences: user.preferences || {},
        recentOrders: user.recentOrders || [],
        bookings: user.bookings || [],
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name phone email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
