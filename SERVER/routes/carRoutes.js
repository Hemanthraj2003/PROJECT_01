const express = require("express");
const {
  getAllCars,
  getAllPendingCars,
  getCarsByIds,
  postCarForApproval,
  getFilteredCars,
} = require("../services/dboperations");
const router = express.Router();

// handles route /cars/ ...
router.get("/", getAllCars);
router.post("/", getFilteredCars);
router.post("/post", postCarForApproval);
router.get("/pending", getAllPendingCars);
router.post("/getMyCars", getCarsByIds);

module.exports = router;
