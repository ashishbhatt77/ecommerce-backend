const express = require("express");
const {
  addToCart,
  getCart,
  updateCartItem,
  removeItem,
} = require("../controllers/cartController");
const { roleAuthorization } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", roleAuthorization(["customer"]), addToCart);

router.get("/", roleAuthorization(["customer"]), getCart);

router.put("/update", roleAuthorization(["customer"]), updateCartItem);

router.delete("/remove", roleAuthorization(["customer"]), removeItem);

module.exports = router;