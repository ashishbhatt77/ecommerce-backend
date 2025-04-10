const Customer = require("../models/customerModel");

const addMoneyToWallet = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.walletBalance += amount;
        await user.save();

        res.status(200).json({ success: true, message: "Money added to wallet", walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deductMoneyFromWallet = async (userId, amount) => {
    const user = await User.findById(userId);
    if (!user || user.walletBalance < amount) {
        throw new Error("Insufficient wallet balance");
    }

    user.walletBalance -= amount;
    await user.save();
    return user.walletBalance;
};

const getWalletBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addMoneyToWallet, deductMoneyFromWallet, getWalletBalance };