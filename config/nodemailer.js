// config/nodemailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port:587,
  secure:false,
  auth: {
    user: process.env.GMAIL_USER,      // your Gmail
    pass: process.env.GMAIL_PASS,      // App password (not normal Gmail password!)
  },
});

export default transporter;
