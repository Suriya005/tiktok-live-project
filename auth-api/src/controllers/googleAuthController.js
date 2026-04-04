const { google } = require('googleapis');
const config = require('../config/config');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../utils/errors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.callbackUrl
);

/**
 * Generate access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    config.jwt.accessTokenSecret,
    {
      expiresIn: config.jwt.accessTokenExpiry,
    }
  );
};

/**
 * Generate refresh token (JWT-based with hash stored in DB)
 */
const generateRefreshToken = (user) => {
  const payload = {
    sub: user._id.toString(),
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });
};

/**
 * Hash token for storage
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Parse expiry string to milliseconds
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

/**
 * @route   GET /api/v1/auth/google
 * @desc    Get Google OAuth URL
 * @access  Public
 */
const getGoogleAuthUrl = asyncHandler(async (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force to show consent screen
  });

  res.status(200).json({
    success: true,
    data: {
      authUrl,
    },
  });
});

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 */
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    throw new AppError('Authorization code is required', 400, 'NO_AUTH_CODE');
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser.email) {
      throw new AppError(
        'Unable to retrieve email from Google',
        400,
        'NO_EMAIL'
      );
    }

    // Check if user exists
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      // If user exists but doesn't have googleId, update it
      if (!user.googleId) {
        await User.updateById(user._id, {
          googleId: googleUser.id,
          avatar: googleUser.picture,
        });
        user.googleId = googleUser.id;
        user.avatar = googleUser.picture;
      }
    } else {
      // Create new user
      user = await User.create({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.id,
        avatar: googleUser.picture,
        isGoogleUser: true,
        role: 'user',
      });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store hashed refresh token
    const hashedToken = hashToken(refreshToken);
    const refreshTokenExpiry = parseExpiryToMs(config.jwt.refreshTokenExpiry);
    await User.addRefreshToken(user._id, hashedToken, refreshTokenExpiry);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: refreshTokenExpiry,
    });

    // Redirect to frontend with tokens in URL (for SPA)
    const redirectUrl = `${config.frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth Error:', error);
    
    // Redirect to frontend with error
    const errorUrl = `${config.frontendUrl}/auth/error?message=${encodeURIComponent(
      error.message || 'Authentication failed'
    )}`;
    
    res.redirect(errorUrl);
  }
});

/**
 * @route   POST /api/v1/auth/google/token
 * @desc    Authenticate with Google ID token (for mobile/SPA)
 * @access  Public
 */
const googleTokenAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError('Google ID token is required', 400, 'NO_ID_TOKEN');
  }

  try {
    // Verify the ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    
    if (!payload.email) {
      throw new AppError(
        'Unable to retrieve email from token',
        400,
        'NO_EMAIL'
      );
    }

    // Check if user exists
    let user = await User.findOne({ email: payload.email });

    if (user) {
      // Update Google info if needed
      if (!user.googleId) {
        await User.updateById(user._id, {
          googleId: payload.sub,
          avatar: payload.picture,
        });
        user.googleId = payload.sub;
        user.avatar = payload.picture;
      }
    } else {
      // Create new user
      user = await User.create({
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        avatar: payload.picture,
        role: 'user',
      });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store hashed refresh token
    const hashedToken = hashToken(refreshToken);
    const refreshTokenExpiry = parseExpiryToMs(config.jwt.refreshTokenExpiry);
    await User.addRefreshToken(user._id, hashedToken, refreshTokenExpiry);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: refreshTokenExpiry,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Google Token Verification Error:', error);
    throw new AppError(
      'Invalid Google ID token',
      401,
      'INVALID_GOOGLE_TOKEN'
    );
  }
});

module.exports = {
  getGoogleAuthUrl,
  googleCallback,
  googleTokenAuth,
};
