const express = require("express");
const {
  getAllUsers,
  registerUsers,
  checkUserExists,
  updateProfile,
  generateOtp,
} = require("../services/dboperations");
const router = express.Router();

// dummy structe of how the data will be ...

// handles route  /users/ ...
router.get("/", getAllUsers);
router.post("/signup", registerUsers);
router.post("/otp", generateOtp);

router.get("/isExists", checkUserExists);
router.post("/update", updateProfile);

module.exports = router;
