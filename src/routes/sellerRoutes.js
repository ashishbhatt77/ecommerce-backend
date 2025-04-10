require("dotenv").config();
const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/SellerController/sellerController");
const { roleAuthorization } = require("../middleware/authMiddleware");

router.post("/register", sellerController.registerSeller);
router.post("/verify-otp", sellerController.verifySellerOtp);

router.route("/:id")
  .get(roleAuthorization(["seller"]), sellerController.getSeller)
  .put(roleAuthorization(["seller"]), sellerController.updateSeller)
  .delete(roleAuthorization(["seller"]), sellerController.deleteSeller);

module.exports = router;
