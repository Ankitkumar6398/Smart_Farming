const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const router = express.Router();

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8001/predict";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  }
});

const normalizeResponse = (payload) => {
  const data = payload?.data || payload || {};
  return {
    crop_type: data.crop_type || data.crop || "Unknown",
    disease: data.disease || data.label || data.class || "Unknown",
    confidence: data.confidence ?? data.probability ?? data.score ?? null,
    description: data.description || "",
    treatment: data.treatment || data.solution || "",
    prevention: data.prevention || data.prevention_tips || "",
    recommendations: data.recommendations || data.recommendation || null,
    raw: data
  };
};

// @route   POST /api/crop-health/analyze
// @desc    Analyze crop image using local AI service
// @access  Public
router.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required"
      });
    }

    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname || "image.jpg",
      contentType: req.file.mimetype
    });

    const response = await axios.post(AI_SERVICE_URL, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 30000
    });

    return res.status(200).json({
      success: true,
      data: normalizeResponse(response.data)
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message || "AI service error";
    return res.status(status).json({
      success: false,
      message
    });
  }
});

module.exports = router;
