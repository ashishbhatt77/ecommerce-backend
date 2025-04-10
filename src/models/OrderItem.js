const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Returned"],
    default: "Pending",
  },
  sellerEarnings: { type: Number, default: 0 },
  adminCommission: { type: Number, default: 0 },
  refundStatus: {
    type: String,
    enum: ["Not Requested", "Requested", "Approved", "Rejected", "Refunded"],
    default: "Not Requested",
  },
  deliveryDate: { type: Date, default: null },
}, { _id: false });

module.exports = orderItemSchema;
