require('dotenv').config();
const express = require('express');
const config = require('./config/config');
const { connectDB } = require('./config/db');
const { 
  connectToTikTokLive, 
  disconnectFromTikTokLive, 
  getConnectionStatus 
} = require('./services/tiktokService');

const app = express();

// Middleware
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TikTok Gift Processor is running',
    status: getConnectionStatus(),
  });
});

// Start TikTok connection
app.post('/connect', async (req, res) => {
  try {
    console.log('Received connection request:', req.body);
    const { username } = req.body;
    await connectToTikTokLive(username);
    
    res.json({
      success: true,
      message: 'Connected to TikTok Live',
      status: getConnectionStatus(),
    });
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// Stop TikTok connection
app.post('/disconnect', (req, res) => {
  disconnectFromTikTokLive();
  
  res.json({
    success: true,
    message: 'Disconnected from TikTok Live',
  });
});

// Get connection status
app.get('/status', (req, res) => {
  res.json({
    success: true,
    data: getConnectionStatus(),
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('⚠️ MongoDB connection failed:', error.message);
    console.log('📝 Server will continue without MongoDB...');
  }
  
  // Start Express server
  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📡 Environment: ${config.env}`);
    console.log(`🎮 Game ID: ${config.game.gameId}`);
    console.log(`\n📝 API Endpoints:`);
    console.log(`   GET  /          - Health check`);
    console.log(`   GET  /status    - Connection status`);
    console.log(`   POST /connect   - Connect to TikTok Live`);
    console.log(`   POST /disconnect - Disconnect from TikTok Live`);
    
    // Username will be received from frontend
    console.log(`\n📝 Waiting for connection request from frontend...`);
    console.log(`   Use POST /connect with username to start TikTok Live connection`);
  });
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  disconnectFromTikTokLive();
  process.exit(0);
});

// Start the server
startServer();
