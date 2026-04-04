require('dotenv').config();

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  apiVersion: process.env.API_VERSION || 'v1',

  // CORS
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS === '*' 
      ? '*' 
      : (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // Roblox Security
  roblox: {
    apiKey: process.env.X_API_KEY,  // API Key ที่ Roblox ส่งมาใน header
    placeIds: (process.env.ROBLOX_PLACE_IDS || '').split(',').filter(Boolean),
  },

  // External APIs
  authApiUrl: process.env.AUTH_API_URL || 'http://localhost:3001/api/v1',
  tiktokConnectorUrl: process.env.TIKTOK_CONNECTOR_URL || 'http://localhost:8080',

  // MongoDB
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGO_DB_NAME || 'tiktok_live_auth',
  },
};

module.exports = config;
