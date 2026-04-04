/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error for debugging (ใน production ควรใช้ logger เช่น Winston)
  if (isDevelopment) {
    console.error('Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
  } else {
    // Production: log แค่ข้อมูลสำคัญ (ไม่ log stack)
    console.error('Error:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    error = new AppError(
      `${field} already exists`,
      409,
      'DUPLICATE_FIELD'
    );
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      errors
    );
  }

  // MongoDB cast error
  if (err.name === 'CastError') {
    error = new AppError(
      'Invalid ID format',
      400,
      'INVALID_ID'
    );
  }

  // JWT errors are handled in authMiddleware
  
  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  const response = {
    success: false,
    error: {
      code,
      message: error.message || 'Internal server error',
    },
  };

  // Add details if available
  if (error.details) {
    response.error.details = error.details;
  }

  // ⚠️ แสดง stack trace เฉพาะใน development เท่านั้น
  if (isDevelopment && error.stack) {
    response.error.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Async handler to wrap async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
};
