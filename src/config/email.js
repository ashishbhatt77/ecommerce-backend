const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOtpEmail = async (email, subject = "Your OTP Code", otp, type = "") => {
  try {
    const templates = {
      sellerRegistration: `
        <p>Hello,</p>
        <p>To complete your seller registration, use this OTP:</p>
        <h3 style="color: #4CAF50;">${otp}</h3>
        <p>This OTP is valid for 5 minutes.</p>
      `,
      resetPassword: `
        <p>Hello,</p>
        <p>Use this OTP to reset your password:</p>
        <h3 style="color: #FF6347;">${otp}</h3>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    };

    const htmlContent = templates[type] || `
      <p>Hello,</p>
      <p>Your OTP Code:</p>
      <h3>${otp}</h3>
      <p>This OTP is valid for 5 minutes.</p>
    `;

    await transporter.sendMail({
      from: `"Digital Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email.");
  }
};

module.exports = { sendOtpEmail };