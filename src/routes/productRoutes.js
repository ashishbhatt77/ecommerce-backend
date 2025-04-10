const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { 
  addProduct, 
  publishProduct,
  updateProduct, 
  deleteProduct, 
  getSellerProducts, 
  getActiveProducts, 
  getProductById,
  isAdvertised,
  getAdvertisedProducts,
  getProductsByCategory
} = require("../controllers/productController");
const { roleAuthorization } = require("../middleware/authMiddleware");

router.post("/add", roleAuthorization(["seller"]), upload.array("images", 5), addProduct);

router.get("/active", getActiveProducts);
router.get("/advertised", getAdvertisedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/seller/products", roleAuthorization(["seller"]), getSellerProducts);
router.get("/:id", getProductById);

router.put("/:id", roleAuthorization(["seller"]), upload.array("images", 5), updateProduct);
router.put("/advertise/:id", roleAuthorization(["admin"]), isAdvertised);
router.put("/publish/:id", roleAuthorization(["seller"]), publishProduct);

router.delete("/:id", roleAuthorization(["seller"]), deleteProduct);

module.exports = router;