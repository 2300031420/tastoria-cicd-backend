// config/nodemailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST || "smtp.gmail.com",
  port: 587,              // try 465 if 587 fails
  secure: false,          // true for 465, false for 587
  auth: {
    user: process.env.GMAIL_USER,   // your Gmail
    pass: process.env.GMAIL_PASS,   // App password (not normal Gmail password!)
  },
  logger: true,  // log everything
  debug: true,   // show SMTP traffic
});

// Verify transporter at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer transporter error:", error);
  } else {
    console.log("✅ Nodemailer transporter is ready to send emails");
  }
});

export default transporter;
