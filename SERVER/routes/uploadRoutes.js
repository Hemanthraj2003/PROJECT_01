const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadConfig");

router.post("/upload-images", upload.array("images", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrls = req.files.map(
      (file) => `${baseUrl}/uploads/${file.filename}`
    );

    res.status(200).json({
      success: true,
      imageUrls,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading files",
    });
  }
});

module.exports = router;
