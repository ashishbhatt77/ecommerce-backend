const express = require("express");
const { 
    getAllUsers, 
    approveSeller, 
    rejectSeller, 
    getAllSellers, 
} = require("../controllers/AdminController/AdminController");

const { roleAuthorization } = require("../middleware/authMiddleware");

const { 
    getSliders, 
    addSlider, 
    deleteSlider 
} = require("../controllers/AdminController/sliderController");

const router = express.Router();

router.get("/users", roleAuthorization(["admin"]), getAllUsers);
router.get("/sellers", roleAuthorization(["admin"]), getAllSellers);
router.put("/approve-seller/:id", roleAuthorization(["admin"]), approveSeller);
router.delete("/reject-seller/:id", roleAuthorization(["admin"]), rejectSeller);

router.get("/sliders",  getSliders);
router.post("/sliders", roleAuthorization(["admin"]), addSlider);
router.delete("/sliders/:id", roleAuthorization(["admin"]), deleteSlider);

module.exports = router;