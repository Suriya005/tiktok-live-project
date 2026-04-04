const { body, validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

/**
 * Validation rules for registration
 */
const registerValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for refresh token
 * Allow refresh token from either body OR cookie
 */
const refreshTokenValidation = [
  body('refreshToken')
    .optional() // ไม่บังคับใน body
    .isString()
    .withMessage('Refresh token must be a string'),
];

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    throw new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      errorMessages
    );
  }
  
  next();
};

/**
 * Custom middleware to validate refresh token from cookie or body
 */
const validateRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  
  if (!refreshToken) {
    throw new AppError(
      'Refresh token is required',
      401,
      'NO_REFRESH_TOKEN'
    );
  }
  
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  validate,
  validateRefreshToken,
};
