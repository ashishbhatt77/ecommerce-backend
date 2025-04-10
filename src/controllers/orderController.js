const Order = require("../models/Order");
const Cart = require("../models/cartModel");

const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      shippingAddress,
      paymentMethod,
      shippingCharge = 0,
      couponCode = null,
      discount = 0,
      expectedDeliveryDate = null
    } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product items.seller");
  
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = cart.items.map(item => {
      const adminCommission = item.price * 0.10;
      const sellerEarnings = item.price - adminCommission;
      return {
        product: item.product._id,
        seller: item.seller._id,
        quantity: item.quantity,
        price: item.price,
        sellerEarnings,
        adminCommission,
        status: "Pending",
        refundStatus: "Not Requested",
        deliveryDate: null
      };
    });

    const totalProductPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalPrice = totalProductPrice + shippingCharge - discount;

    const order = await Order.create({
      user: userId,
      items,
      totalPrice,
      shippingCharge,
      couponCode,
      discount,
      shippingAddress,
      paymentMethod,
      expectedDeliveryDate,
      orderStatus: "Pending"
    });

    await Cart.deleteOne({ user: userId });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

// ✅ Customer: Get all orders
const getCustomerOrderList = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product items.seller")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// ✅ Customer: Track a specific order
const trackCustomerOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.product items.seller user");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

// ✅ Seller: Get seller's order list
const getSellerOrderList = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const orders = await Order.find({ "items.seller": sellerId })
      .populate("user items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller orders", error: error.message });
  }
};

// ✅ Seller: Update item status (Shipped, Delivered, etc.)
const updateItemStatusBySeller = async (req, res) => {
  try {
    const { orderId, productId, newStatus, deliveryDate } = req.body;
    const sellerId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      "items.product": productId,
      "items.seller": sellerId
    });

    if (!order) return res.status(404).json({ message: "Order not found or unauthorized" });

    const item = order.items.find(
      i => i.product.toString() === productId && i.seller.toString() === sellerId
    );

    if (!item) return res.status(404).json({ message: "Item not found" });

    item.status = newStatus;
    if (deliveryDate) item.deliveryDate = deliveryDate;

    await order.save();
    res.status(200).json({ message: "Item status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update item status", error: error.message });
  }
};

// ✅ Admin: Get all orders
const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user items.product items.seller")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all orders", error: error.message });
  }
};

// ✅ Admin: Update full order status
const updateOrderStatusByAdmin = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
};

// ✅ All Roles: Get order details by ID
const getOrderDetailsById = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate("user items.product items.seller");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order details", error: error.message });
  }
};

module.exports = {
  createOrderFromCart,
  getCustomerOrderList,
  trackCustomerOrder,
  getSellerOrderList,
  updateItemStatusBySeller,
  getAllOrdersForAdmin,
  updateOrderStatusByAdmin,
  getOrderDetailsById
};
