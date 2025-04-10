const express = require("express");
const router = express.Router();
const { addMoneyToWallet, getWalletBalance, walletPayment } = require("../controllers/paymentController");
const { roleAuthorization } = require("../middleware/authMiddleware");

router.post("/wallet-payment", roleAuthorization(["customer"]), walletPayment);
router.post("/add-money", roleAuthorization(["customer"]), addMoneyToWallet);
router.get("/wallet-balance/:userId", roleAuthorization(["customer"]), getWalletBalance);

module.exports = router;
