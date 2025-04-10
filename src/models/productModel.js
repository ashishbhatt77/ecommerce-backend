const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, default: 0 },
    trackQuantity: { type: Boolean, default: true },
    status: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    discount: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    weight: { type: Number, default: 0 },
    isAdvertised: { type: Boolean, default: false },
    ordersCompleted: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
