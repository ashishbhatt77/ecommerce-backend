const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: "admin" },
    otp: { type: String },
    otpExpires: { type: Date }
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
