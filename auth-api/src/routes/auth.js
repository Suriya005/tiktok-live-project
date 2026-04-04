const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const authController = require('../controllers/authController');
const googleAuthController = require('../controllers/googleAuthController');
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  validate,
  validateRefreshToken,
} = require('../middleware/validation');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
});

router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/refresh', refreshTokenValidation, validate, validateRefreshToken, authController.refresh);
router.post('/logout', authController.logout);

// Google OAuth routes
router.get('/google', googleAuthController.getGoogleAuthUrl);
router.get('/google/callback', googleAuthController.googleCallback);
router.post('/google/token', authLimiter, googleAuthController.googleTokenAuth);

module.exports = router;

