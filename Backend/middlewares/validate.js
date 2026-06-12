const VALID_AGE_GROUPS = ["kid", "adult", "senior"];
const VALID_GENDERS = ["male", "female"];
const VALID_MODEL_STYLES = ["ecommerce", "fashion", "luxury", "casual", "traditional"];
const VALID_POSES = ["standing_front", "standing_angle", "walking", "crossed_arms"];
const VALID_GENERATIONS = [1, 2, 4, 8];

const validate = (req, res, next) => {
  const { ageGroup, gender, backgroundColor, modelStyle, pose, generations } = req.body;
  const files = req.files;

  // ─── Required: Images ───────────────────────────────────────
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one clothing image is required.",
    });
  }

  // ─── Required: Age Group ────────────────────────────────────
  if (!ageGroup || !VALID_AGE_GROUPS.includes(ageGroup.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid age group. Choose from: ${VALID_AGE_GROUPS.join(", ")}`,
    });
  }

  // ─── Required: Gender ───────────────────────────────────────
  if (!gender || !VALID_GENDERS.includes(gender.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid gender. Choose from: ${VALID_GENDERS.join(", ")}`,
    });
  }

  // ─── Optional: Model Style (default: ecommerce) ─────────────
  if (modelStyle && !VALID_MODEL_STYLES.includes(modelStyle.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid model style. Choose from: ${VALID_MODEL_STYLES.join(", ")}`,
    });
  }

  // ─── Optional: Pose (default: standing_front) ───────────────
  if (pose && !VALID_POSES.includes(pose.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid pose. Choose from: ${VALID_POSES.join(", ")}`,
    });
  }

  // ─── Optional: Generations (default: 1) ─────────────────────
  const genCount = parseInt(generations);
  if (generations && !VALID_GENERATIONS.includes(genCount)) {
    return res.status(400).json({
      success: false,
      message: `Invalid generation count. Choose from: ${VALID_GENERATIONS.join(", ")}`,
    });
  }

  // ─── Optional: Background Color — basic hex validation ──────
  if (backgroundColor && !/^#([0-9A-Fa-f]{6})$/.test(backgroundColor)) {
    return res.status(400).json({
      success: false,
      message: "Invalid background color. Use hex format like #FFFFFF",
    });
  }

  next();
};

module.exports = validate;