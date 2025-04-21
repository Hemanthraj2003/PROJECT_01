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
router.post("/signup", registerUsers);
router.put("/update", updateProfile);
router.get("/isExists", checkUserExists);
router.get("/:id", getUserById);

module.exports = router;
