const config = require('../config/config');
const { AppError } = require('./errorHandler');

/**
 * Verify API Key ที่ Roblox ส่งมา
 */
const verifyApiKey = (req, res, next) => {
  // รับ x-api-key จาก header ที่ Roblox ส่งมา
  const apiKey = req.headers['x-api-key'];
  console.log('Received API Key:', apiKey);
  console.log('Expected API Key:', config.roblox.apiKey);

  if (!apiKey) {
    throw new AppError('API key is required', 401, 'NO_API_KEY');
  }

  // เทียบกับค่าใน .env
  if (apiKey !== config.roblox.apiKey) {
    throw new AppError('Invalid API key', 401, 'INVALID_API_KEY');
  }

  next();
};

/**
 * Verify Roblox Place ID
 */
const verifyPlaceId = (req, res, next) => {
  const placeId = req.headers['roblox-place-id'] || req.body.placeId;

  if (!placeId) {
    throw new AppError('Place ID is required', 400, 'NO_PLACE_ID');
  }

  // Skip verification if no place IDs configured (allow all)
  if (config.roblox.placeIds.length === 0) {
    req.placeId = placeId;
    return next();
  }

  if (!config.roblox.placeIds.includes(placeId.toString())) {
    throw new AppError('Unauthorized place ID', 403, 'UNAUTHORIZED_PLACE');
  }

  req.placeId = placeId;
  next();
};

/**
 * Verify Roblox User ID (from game)
 */
const verifyRobloxUser = (req, res, next) => {
  const userId = req.headers['roblox-user-id'] || req.body.userId;

  if (!userId) {
    throw new AppError('Roblox User ID is required', 400, 'NO_USER_ID');
  }

  req.robloxUserId = userId;
  next();
};

module.exports = {
  verifyApiKey,
  verifyPlaceId,
  verifyRobloxUser,
};
