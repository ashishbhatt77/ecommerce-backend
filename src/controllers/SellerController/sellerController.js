const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Customer = require("../../models/customerModel");
const Seller = require("../../models/SellerPanelModule/sellerModel");
const SuperAdmin = require("../../models/AdminPanelModule/registerModel");
const { sendOtpEmail } = require("../../config/email");

dotenv.config();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const registerSeller = async (req, res) => {
  try {
    const { businessEmail, password } = req.body;
    if (!businessEmail) {
      return res.status(400).json({ message: "Business email is required." });
    }

    const existingSeller = await Seller.findOne({ businessEmail });
    const existingCustomer = await Customer.findOne({ email: businessEmail });
    const existingSuperAdmin = await SuperAdmin.findOne({ email: businessEmail });

    if (existingSeller || existingCustomer || existingSuperAdmin) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = new Seller({
      ...req.body,
      password: hashedPassword,
      otp,
      otpCreatedAt: Date.now(),
    });
    await newSeller.save();

    await sendOtpEmail(businessEmail, "Your OTP Code", otp, "sellerRegistration");
    res.status(200).json({ message: "OTP sent to email. Verify to complete registration." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const verifySellerOtp = async (req, res) => {
  try {
    const { businessEmail, otp } = req.body;
    const seller = await Seller.findOne({ businessEmail });

    if (!seller || seller.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }
    if (Date.now() - seller.otpCreatedAt > 120000) {
      return res.status(400).json({ message: "OTP expired." });
    }

    seller.isVerified = true;
    seller.otp = null;
    seller.otpCreatedAt = null;
    await seller.save();

    res.status(200).json({ message: "Seller verified successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const getSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json(seller);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const updateSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Seller updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    await Seller.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Seller deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

module.exports = {
  registerSeller,
  verifySellerOtp,
  getSeller,
  updateSeller,
  deleteSeller,
};
