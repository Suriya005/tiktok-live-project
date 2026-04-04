const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const { AppError } = require('../utils/errors');

/**
 * Verify access token and attach user to request
 */
const verifyAccessToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.accessTokenSecret);

    // Attach user info to request
    req.user = {
      sub: decoded.sub,
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    }
    next(error);
  }
};

/**
 * Attach full user object to request (optional, for profile routes)
 */
const attachUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId); // includePassword: false by default but can be changed if needed etc. findById(userId, { includePassword: true })
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    req.userDocument = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require specific role(s)
 * @param {string|string[]} roles - Required role(s)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('Authentication required', 401, 'UNAUTHORIZED')
      );
    }

    const hasRole = roles.includes(req.user.role);
    
    if (!hasRole) {
      return next(
        new AppError(
          'Insufficient permissions',
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

/**
 * Optional authentication - attach user if token is valid, but don't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.accessTokenSecret);

    req.user = {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
};

module.exports = {
  verifyAccessToken,
  attachUser,
  requireRole,
  optionalAuth,
};
