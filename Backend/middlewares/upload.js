const multer = require("multer");
const path = require("path");

const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "10");
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// ─── Storage: Memory (no disk write, send directly to AI) ─────
const storage = multer.memoryStorage();

// ─── File Filter ──────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("INVALID_FORMAT"), false);
  }
};

// ─── Multer Config ────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024, // Convert MB to bytes
    files: 4,
  },
});

module.exports = upload;