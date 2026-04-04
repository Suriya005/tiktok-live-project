require('dotenv').config();

const config = {
  // Server
  port: 3344,
  env: process.env.NODE_ENV || 'development',

  // TikTok (username will be received from frontend)
  tiktok: {
    username: null,
    sessionId: process.env.TIKTOK_SESSION_ID || null,
  },

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tiktok_live_auth',
  },

  // Roblox API
  roblox: {
    apiUrl: process.env.ROBLOX_API_URL || 'http://localhost:4000/api/v1',
    apiKey: process.env.ROBLOX_API_KEY || 'RobloxKey2025',
  },

  // Game
  game: {
    gameId: process.env.GAME_ID || '1234',
  },
};

module.exports = config;
