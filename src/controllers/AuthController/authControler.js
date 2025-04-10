const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Customer = require("../../models/customerModel");
const Seller = require("../../models/SellerPanelModule/sellerModel");
const Admin = require("../../models/AdminPanelModule/registerModel");
const { sendOtpEmail } = require("../../config/email");

const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const loginUser = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;
    if (!emailOrMobile || !password) {
      return res.status(400).json({ success: false, message: "Email/Phone and Password are required." });
    }

    let user =
      (await Customer.findOne({ email: emailOrMobile }).select("+password").lean()) ||
      (await Seller.findOne({ businessEmail: emailOrMobile }).select("+password +approved").lean()) ||
      (await Admin.findOne({ email: emailOrMobile }).select("+password").lean());

    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password." });

    if (user.role === "seller" && !user.approved) {
      return res.status(403).json({ success: false, message: "Your account is pending approval." });
    }

    if (!user.role) {
      return res.status(500).json({ success: false, message: "User role is missing. Please contact support." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ success: true, token, role: user.role, message: "Login successful!" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    let user =
      (await Customer.findOne({ email })) ||
      (await Seller.findOne({ businessEmail: email })) ||
      (await Admin.findOne({ email }));

    if (!user) return res.status(400).json({ success: false, message: "User not found." });

    user.otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otpExpires = Date.now() + 2 * 60 * 1000;
    await user.save();

    await sendOtpEmail(email, "Password Reset OTP", user.otp, "resetPassword");

    res.status(200).json({ success: true, message: "OTP sent to your email. Please check your inbox." });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmPassword) return res.status(400).json({ success: false, message: "All fields are required." });

    if (newPassword !== confirmPassword) return res.status(400).json({ success: false, message: "Passwords do not match." });

    let user =
      (await Customer.findOne({ email })) ||
      (await Seller.findOne({ businessEmail: email })) ||
      (await Admin.findOne({ email }));

    if (!user) return res.status(400).json({ success: false, message: "User not found." });

    if (!user.otp || user.otp !== otp || Date.now() > user.otpExpires) return res.status(400).json({ success: false, message: "Invalid or expired OTP." });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

module.exports = { loginUser, forgotPassword, resetPassword };