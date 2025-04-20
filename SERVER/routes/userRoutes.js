const express = require("express");
const {
  getAllUsers,
  registerUsers,
  updateProfile,
  checkUserExists,
  getUserById,
} = require("../services/dboperations");

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/signup", registerUsers);
router.put("/update", updateProfile);
router.get("/isExists", checkUserExists);

module.exports = router;
