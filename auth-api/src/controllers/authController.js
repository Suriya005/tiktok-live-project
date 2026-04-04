const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../utils/errors');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate JWT access token
 * @param {Object} user - User object
 * @returns {String} JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    config.jwt.accessTokenSecret,
    { expiresIn: config.jwt.accessTokenExpiry }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} user - User object
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    sub: user._id.toString(),
    type: 'refresh',
  };

  return jwt.sign(
    payload,
    config.jwt.refreshTokenSecret,
    { expiresIn: config.jwt.refreshTokenExpiry }
  );
};

/**
 * Hash token using SHA-256
 * @param {String} token - Token to hash
 * @returns {String} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Parse expiry string to milliseconds
 * @param {String} expiry - Expiry string (e.g., '7d', '24h', '60m')
 * @returns {Number} Milliseconds
 */
const parseExpiryToMs = (expiry) => {
  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('Invalid expiry format');

  return parseInt(match[1]) * units[match[2]];
};

// ============================================================================
// AUTH CONTROLLERS
// ============================================================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  // 2. Create new user
  const user = await User.create({
    email,
    password,
    name,
    role: 'user',
  });

  // 3. Generate JWT tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // 4. Store hashed refresh token in database
  const hashedToken = hashToken(refreshToken);
  const refreshTokenExpiry = parseExpiryToMs(config.jwt.refreshTokenExpiry);
  await User.addRefreshToken(user._id, hashedToken, refreshTokenExpiry);

  // 5. Set refresh token as HttpOnly cookie (for web clients)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: refreshTokenExpiry,
  });

  // 6. Send response
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken, // Also in body for mobile clients
    },
  });
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user by email (include password field)
  const user = await User.findOne({ email }, { includePassword: true });
  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 2. Verify password
  const isPasswordValid = await User.comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 3. Generate JWT tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // 4. Store hashed refresh token in database
  const hashedToken = hashToken(refreshToken);
  const refreshTokenExpiry = parseExpiryToMs(config.jwt.refreshTokenExpiry);
  await User.addRefreshToken(user._id, hashedToken, refreshTokenExpiry);

  // 5. Set refresh token as HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: refreshTokenExpiry,
  });

  // 6. Send response
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken, // Also in body for mobile clients
    },
  });
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token (token rotation)
 * @access  Public
 */
const refresh = asyncHandler(async (req, res) => {
  // 1. Get refresh token from cookie or request body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    throw new AppError('Refresh token required', 401, 'NO_REFRESH_TOKEN');
  }

  // 2. Verify JWT refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);
  } catch (error) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  // 3. Find user by ID from token
  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // 4. Verify refresh token exists in database
  const hashedToken = hashToken(refreshToken);
  const isValidToken = User.hasValidRefreshToken(user, hashedToken);
  if (!isValidToken) {
    throw new AppError(
      'Refresh token is invalid or expired',
      401,
      'INVALID_REFRESH_TOKEN'
    );
  }

  // 5. Generate new tokens (token rotation)
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // 6. Remove old refresh token from database
  await User.removeRefreshToken(user._id, hashedToken);

  // 7. Store new hashed refresh token
  const newHashedToken = hashToken(newRefreshToken);
  const refreshTokenExpiry = parseExpiryToMs(config.jwt.refreshTokenExpiry);
  await User.addRefreshToken(user._id, newHashedToken, refreshTokenExpiry);

  // 8. Set new refresh token cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: refreshTokenExpiry,
  });

  // 9. Send response with new tokens
  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // Also in body for mobile clients
    },
  });
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // 1. Get refresh token from cookie or request body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  // 2. If refresh token exists, remove it from database
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);
      const user = await User.findById(decoded.sub);

      if (user) {
        const hashedToken = hashToken(refreshToken);
        await User.removeRefreshToken(user._id, hashedToken);
      }
    } catch (error) {
      // Token might be invalid, but we still want to clear the cookie
      console.error('Logout error:', error.message);
    }
  }

  // 3. Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
  });

  // 4. Send success response
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  register,
  login,
  refresh,
  logout,
};
