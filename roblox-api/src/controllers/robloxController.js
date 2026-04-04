const axios = require('axios');
const config = require('../config/config');
const { AppError } = require('../middleware/errorHandler');

// In-memory storage (ในโปรเจคจริงควรใช้ Redis หรือ Database)
const activeSessions = new Map();

/**
 * @route   POST /api/v1/roblox/events
 * @desc    Handle events from Roblox game
 */
const handleEvent = async (req, res) => {
  const { eventType, data } = req.body;
  const { placeId, robloxUserId } = req;

  console.log(`[Event] Type: ${eventType}, Place: ${placeId}, User: ${robloxUserId}`);

  // Process different event types
  switch (eventType) {
    case 'player_joined':
      await handlePlayerJoined(placeId, robloxUserId, data);
      break;
    case 'player_left':
      await handlePlayerLeft(placeId, robloxUserId, data);
      break;
    case 'gift_received':
      await handleGiftReceived(placeId, robloxUserId, data);
      break;
    case 'comment_received':
      await handleCommentReceived(placeId, robloxUserId, data);
      break;
    default:
      console.warn(`Unknown event type: ${eventType}`);
  }

  res.json({
    success: true,
    message: 'Event received',
    data: {
      eventType,
      processed: true,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * @route   GET /api/v1/roblox/status/:placeId
 * @desc    Get TikTok Live status
 */
const getStatus = async (req, res) => {
  const { placeId } = req.params;

  const session = activeSessions.get(placeId);

  if (!session) {
    return res.json({
      success: true,
      data: {
        connected: false,
        placeId,
      },
    });
  }

  // Check TikTok connector status
  try {
    const response = await axios.get(`${config.tiktokConnectorUrl}/status`);
    
    res.json({
      success: true,
      data: {
        connected: true,
        placeId,
        tiktokUsername: session.tiktokUsername,
        connectedAt: session.connectedAt,
        tiktokStatus: response.data,
      },
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        connected: true,
        placeId,
        tiktokUsername: session.tiktokUsername,
        connectedAt: session.connectedAt,
        tiktokStatus: { error: 'Cannot reach TikTok connector' },
      },
    });
  }
};

/**
 * @route   POST /api/v1/roblox/connect
 * @desc    Connect to TikTok Live
 */
const connectTikTok = async (req, res) => {
  const { tiktokUsername } = req.body;
  const { placeId } = req;

  // Check if already connected
  if (activeSessions.has(placeId)) {
    throw new AppError('Place already connected to TikTok Live', 400, 'ALREADY_CONNECTED');
  }

  try {
    // Connect to TikTok via connector
    const response = await axios.post(`${config.tiktokConnectorUrl}/connect`, {
      username: tiktokUsername,
    });

    // Store session
    activeSessions.set(placeId, {
      tiktokUsername,
      connectedAt: new Date().toISOString(),
      connectionId: response.data.connectionId || placeId,
    });

    res.json({
      success: true,
      message: 'Connected to TikTok Live',
      data: {
        placeId,
        tiktokUsername,
        connectedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('TikTok connection error:', error.message);
    throw new AppError(
      'Failed to connect to TikTok Live',
      500,
      'CONNECTION_FAILED'
    );
  }
};

/**
 * @route   POST /api/v1/roblox/disconnect
 * @desc    Disconnect from TikTok Live
 */
const disconnectTikTok = async (req, res) => {
  const { placeId } = req;

  const session = activeSessions.get(placeId);

  if (!session) {
    throw new AppError('No active TikTok connection', 400, 'NOT_CONNECTED');
  }

  try {
    // Disconnect from TikTok connector
    await axios.post(`${config.tiktokConnectorUrl}/disconnect`, {
      connectionId: session.connectionId,
    });

    // Remove session
    activeSessions.delete(placeId);

    res.json({
      success: true,
      message: 'Disconnected from TikTok Live',
      data: {
        placeId,
      },
    });
  } catch (error) {
    // Remove session anyway
    activeSessions.delete(placeId);

    console.error('TikTok disconnection error:', error.message);
    
    res.json({
      success: true,
      message: 'Disconnected from TikTok Live (with errors)',
      data: {
        placeId,
      },
    });
  }
};

/**
 * @route   GET /api/v1/roblox/gifts
 * @desc    Get available gifts
 */
const getGifts = async (req, res) => {
  // Mock gift data (จะต้องดึงจาก TikTok API จริงหรือ database)
  const gifts = [
    { id: 1, name: 'Rose', coins: 1, image: 'rose.png' },
    { id: 2, name: 'TikTok', coins: 1, image: 'tiktok.png' },
    { id: 3, name: 'Heart', coins: 5, image: 'heart.png' },
    { id: 4, name: 'Diamond', coins: 100, image: 'diamond.png' },
  ];

  res.json({
    success: true,
    data: {
      gifts,
      total: gifts.length,
    },
  });
};

// Helper functions
async function handlePlayerJoined(placeId, userId, data) {
  console.log(`Player ${userId} joined place ${placeId}`);
  // Add logic here
}

async function handlePlayerLeft(placeId, userId, data) {
  console.log(`Player ${userId} left place ${placeId}`);
  // Add logic here
}

async function handleGiftReceived(placeId, userId, data) {
  console.log(`Gift received in place ${placeId}:`, data);
  // Process gift and notify Roblox
}

async function handleCommentReceived(placeId, userId, data) {
  console.log(`Comment received in place ${placeId}:`, data);
  // Process comment
}

module.exports = {
  handleEvent,
  getStatus,
  connectTikTok,
  disconnectTikTok,
  getGifts,
};
