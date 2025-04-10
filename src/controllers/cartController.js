const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;

    if (!userId || !productId || typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid input data" });
    }

    const product = await Product.findById(productId).populate("seller");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ user: userId });

    const itemData = {
      product: productId,
      seller: product.seller._id,
      quantity,
      price: product.price,
    };

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [itemData],
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push(itemData);
      }
    }

    await cart.save();

    res.status(200).json({ success: true, message: "Product added to cart", cart });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { id } = req.user;

    const cart = await Cart.findOne({ user: id })
      .populate({ path: "items.product", model: "Product" })
      .populate({ path: "items.seller", model: "Seller" });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: { user: req.user.id, items: [] }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Invalid product" });
    }


    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: `Invalid input ${quantity}` });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: "Insufficient stock" });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;

    await cart.save();

    res.status(200).json({ success: true, message: "Cart item updated", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const originalLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product.toString() !== productId.toString());

    const updatedLength = cart.items.length;

    await cart.save();

    res.status(200).json({ success: true, message: "Item removed from cart", cart });
  } catch (err) {
    console.error("Remove item error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeItem
};
