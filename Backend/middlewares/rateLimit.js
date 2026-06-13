const rateLimit = require("express-rate-limit");

const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_PER_MINUTE || "10");

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: RATE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please wait a minute and try again.",
  },
  keyGenerator: (req) => req.ip,
});

module.exports = limiter;