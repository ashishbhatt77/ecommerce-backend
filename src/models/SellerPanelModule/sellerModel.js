const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    businessName: { type: String, trim: true },
    businessType: { type: String, enum: ["sole_proprietorship", "partnership", "pvt_ltd"], trim: true },
    registrationNumber: { type: String, trim: true },
    businessEmail: { type: String, trim: true, lowercase: true },
    businessPhone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    businessWebsite: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    panCardNumber: { type: String, trim: true },
    bankDetails: {
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
    },
    address: {
      registeredAddress: { type: String, trim: true },
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
      pinCode: { type: String, trim: true },
      country: { type: String, default: "India", trim: true },
    },
    productCategories: [{ type: String, trim: true }],
    shippingMethod: { type: String, trim: true },
    termsConditions: { type: Boolean },
    sellerAgreement: { type: Boolean },
    dataPrivacyConsent: { type: Boolean },
    password: { type: String },
    approved: { type: Boolean, default: false },
    role: { type: String, default: "seller", trim: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpCreatedAt: { type: Date, default: Date.now, index: { expires: "120s" } },
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    settlementDetails: { bankName: String, accountNumber: String, ifscCode: String },
    commissionPercentage: { type: Number, default: 10 },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    returnRate: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", sellerSchema);