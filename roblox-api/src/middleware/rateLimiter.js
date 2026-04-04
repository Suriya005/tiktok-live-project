const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// General rate limiter
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for sensitive endpoints
const strictRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please slow down',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  rateLimiter,
  strictRateLimiter,
};
