const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const limiter = require("../middlewares/rateLimit");
const { generateModels } = require("../services/aiService");

/**
 * POST /generate-models
 * Accepts multipart form data with images + config fields
 */
router.post(
  "/generate-models",
  limiter,
  (req, res, next) => {
    // Multer error handling wrapper
    upload.array("images", 4)(req, res, (err) => {
      if (!err) return next();

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: `File size must be under ${process.env.MAX_FILE_SIZE_MB || 10}MB`,
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message: "Maximum 4 images allowed.",
        });
      }
      if (err.message === "INVALID_FORMAT") {
        return res.status(400).json({
          success: false,
          message: "Please upload JPG, PNG or WEBP only.",
        });
      }

      next(err);
    });
  },
  validate,
  async (req, res) => {
    try {
      const { ageGroup, gender, backgroundColor, modelStyle, pose, generations } = req.body;

      console.log(`[generate] Request — provider: ${process.env.AI_PROVIDER}, count: ${generations}`);

      const images = await generateModels({
        files: req.files,
        ageGroup,
        gender,
        backgroundColor: backgroundColor || "#FFFFFF",
        modelStyle: modelStyle || "ecommerce",
        pose: pose || "standing_front",
        generations: parseInt(generations) || 1,
      });

      return res.json({
        success: true,
        images,
      });
    } catch (error) {
      console.error("[generate] Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again.",
      });
    }
  }
);

module.exports = router;