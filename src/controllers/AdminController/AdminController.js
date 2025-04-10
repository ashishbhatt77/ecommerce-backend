const User = require("../../models/customerModel");
const Seller = require("../../models/SellerPanelModule/sellerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const { sendOtpEmail } = require("../../config/email");
const Admin = require("../../models/AdminPanelModule/registerModel");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select("-password");
    res.json(sellers);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const approveSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    seller.approved = true;
    await seller.save();

    res.json({ success: true, message: "Seller Approved", seller });
  } catch (error) {
    console.error("Error approving seller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const rejectSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    await Seller.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Seller Rejected & Removed" });
  } catch (error) {
    console.error("Error rejecting seller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getAllUsers,
  getAllSellers,
  approveSeller,
  rejectSeller,
};