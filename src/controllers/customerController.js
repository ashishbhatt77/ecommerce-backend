const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const moment = require("moment");
const crypto = require("crypto");
const validator = require("validator");

const Customer = require("../models/customerModel");
const Seller = require("../models/SellerPanelModule/sellerModel");
const SuperAdmin = require("../models/AdminPanelModule/registerModel");
const { sendOtpEmail } = require("../config/email");

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

const registerCustomer = async (req, res) => {
  try {
    let { name, mobile, email, password } = req.body;

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    email = email.toLowerCase();

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (!validator.isMobilePhone(mobile, "en-IN")) {
      return res.status(400).json({ message: "Invalid mobile number." });
    }

    const [existingCustomer, existingSeller, existingSuperAdmin] = await Promise.all([
      Customer.findOne({ email }),
      Seller.findOne({ businessEmail: email }),
      SuperAdmin.findOne({ email }),
    ]);

    if (
      (existingCustomer && existingCustomer.isVerified) ||
      existingSeller ||
      existingSuperAdmin
    ) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingCustomer && !existingCustomer.isVerified) {
      existingCustomer.name = name;
      existingCustomer.mobile = mobile;
      existingCustomer.password = hashedPassword;
      existingCustomer.otp = otp;
      existingCustomer.otpCreatedAt = Date.now();
      await existingCustomer.save();

      await sendOtpEmail(email, "Your OTP Code", otp, "customerRegistration");
      return res.status(200).json({
        message: "OTP sent again. Verify to complete registration.",
        email,
      });
    }

    const newCustomer = new Customer({
      name,
      mobile,
      email,
      password: hashedPassword,
      otp,
      otpCreatedAt: Date.now(),
    });

    await newCustomer.save();
    await sendOtpEmail(email, "Your OTP Code", otp, "customerRegistration");

    res.status(200).json({
      message: "OTP sent to email. Verify to complete registration.",
      email,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const verifyCustomerOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const customer = await Customer.findOne({ email: email.toLowerCase() });

    if (!customer) {
      return res.status(400).json({ message: "Customer not found." });
    }

    if (customer.isVerified) {
      return res.status(400).json({ message: "Customer already verified." });
    }

    if (!customer.otp || otp !== customer.otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (moment().isAfter(moment(customer.otpCreatedAt).add(2, "minutes"))) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    customer.isVerified = true;
    customer.otp = null;
    customer.otpCreatedAt = null;
    await customer.save();

    res.status(200).json({ message: "Customer verified successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate("orders")
      .populate("paymentHistory");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.status(200).json({
      message: "Customer updated successfully.",
      updatedCustomer,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);

    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.status(200).json({ message: "Customer deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  registerCustomer,
  verifyCustomerOtp,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};