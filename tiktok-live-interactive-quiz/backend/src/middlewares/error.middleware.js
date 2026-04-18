const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error('[Server] Unhandled error', { err: err.message, stack: err.stack, path: req.path });

  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    data: null,
  });
};

module.exports = errorMiddleware;
