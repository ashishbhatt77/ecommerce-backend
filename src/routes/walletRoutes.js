const express = require("express");
const { addMoneyToWallet, getWalletBalance } = require("../controllers/walletController");
const { roleAuthorization } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add-money", roleAuthorization(["customer"]), addMoneyToWallet);
router.get("/balance/:userId", roleAuthorization(["customer"]), getWalletBalance);

module.exports = router;
