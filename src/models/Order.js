const mongoose = require("mongoose");
const orderItemSchema = require("./OrderItem");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },
  couponCode: { type: String, default: null },
  discount: { type: Number, default: 0 },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "India" },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["Wallet", "PhonePe", "Paytm", "Google Pay", "Razorpay"],
  },
  paymentStatus: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Paid", "Failed", "Refunded"],
  },
  transactionId: { type: String, default: null },
  orderStatus: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Processing", "Partially Shipped", "Completed", "Cancelled"],
  },
  expectedDeliveryDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
