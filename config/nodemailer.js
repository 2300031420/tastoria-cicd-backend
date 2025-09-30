// config/nodemailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST || "smtp.gmail.com",
  port: 465,              // SSL port
  secure: true,           // must be true for 465
  auth: {
    user: process.env.GMAIL_USER,   // your Gmail (full address)
    pass: process.env.GMAIL_PASS,   // Gmail App Password (not normal password!)
  },
  logger: true,   // enable detailed logging
  debug: true,    // show SMTP traffic in console
});

// ✅ Verify connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer verification failed:", error);
  } else {
    console.log("✅ Nodemailer transporter is ready to send emails");
  }
});

export default transporter;
