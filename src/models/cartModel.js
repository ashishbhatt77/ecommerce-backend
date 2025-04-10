const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, 
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
