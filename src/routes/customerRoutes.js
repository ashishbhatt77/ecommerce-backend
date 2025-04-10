const express = require("express");
const customerController = require("../controllers/customerController");
const { roleAuthorization } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", customerController.registerCustomer); 
router.post("/verify-otp", customerController.verifyCustomerOtp);

router.get("/:id", roleAuthorization(["customer"]), customerController.getCustomerById);
router.put("/:id", roleAuthorization(["customer"]), customerController.updateCustomer);
router.delete("/:id", roleAuthorization(["customer"]), customerController.deleteCustomer);

module.exports = router;
