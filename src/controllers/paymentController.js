const User = require("../models/customerModel");
const Cart = require("../models/cartModel");
const order = require("../models/Order");

const addMoneyToWallet = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        if (amount <= 0) return res.status(400).json({ success: false, message: "Invalid amount" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.walletBalance += amount;
        await user.save();

        res.status(200).json({ success: true, message: "Money added successfully", walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWalletBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId, "walletBalance");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const walletPayment = async (req, res) => {
    try {
        const { userId, shippingAddress } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: "Cart is empty" });

        const totalPrice = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

        if (user.walletBalance < totalPrice) return res.status(400).json({ success: false, message: "Insufficient wallet balance" });

        user.walletBalance -= totalPrice;
        await user.save();

        const order = new Order({
            user: userId,
            items: cart.items,
            totalPrice,
            shippingAddress,
            paymentMethod: "Wallet",
            paymentStatus: "Paid",
            orderStatus: "Pending",
            transactionId: `txn_${Date.now()}`
        });

        await order.save();
        await Cart.deleteOne({ user: userId });

        res.status(200).json({ success: true, message: "Payment successful", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addMoneyToWallet, getWalletBalance, walletPayment };