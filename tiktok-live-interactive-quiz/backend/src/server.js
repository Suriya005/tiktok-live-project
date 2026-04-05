require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { connectDB } = require('./config/database');
const apiRoutes = require('./routes/api');
const TiktokService = require('./services/TiktokService');
const QuizService = require('./services/QuizService');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Global TikTok Live status
let tiktokStatus = { isConnected: false, username: null, lastStatusBroadcast: null };

// Middleware
app.use(express.json());
app.use(cors());

// Initialize services
TiktokService.initialize(io);
QuizService.initialize(io);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  let currentTimeFilter = 'all-time';

  // TikTok Live Connection
  socket.on('connect-tiktok', async (data) => {
    const { username } = data;
    console.log(`Connecting to TikTok: @${username}`);
    const result = await TiktokService.connectToLive(username);
    socket.emit('tiktok-connection-result', result);
    
    if (result.success) {
      tiktokStatus = { isConnected: true, username, lastStatusBroadcast: Date.now() };
      io.emit('tiktok-connected', { status: 'connected', username, timestamp: new Date() });
    }
  });

  // Disconnect TikTok
  socket.on('disconnect-tiktok', () => {
    TiktokService.disconnect();
    tiktokStatus = { isConnected: false, username: null, lastStatusBroadcast: Date.now() };
    io.emit('tiktok-disconnected', { timestamp: new Date() });
  });

  // Quiz Session
  socket.on('set-session', (data) => {
    const { sessionId } = data;
    QuizService.setSessionId(sessionId);
    console.log(`Session ID set: ${sessionId}`);
    io.emit('session-set', { sessionId });  // Broadcast to all clients
  });

  // Get current session ID (for overlay on load)
  socket.on('get-current-session', () => {
    const currentSessionId = QuizService.getSessionId();
    console.log(`📌 Sending current session ID: ${currentSessionId}`);
    socket.emit('session-set', { sessionId: currentSessionId });
  });

  // Monitor hint condition continuously
  socket.on('monitor-hint', () => {
    const hintCheckInterval = setInterval(async () => {
      const result = await QuizService.checkHintCondition();
      socket.emit('hint-status', result);
    }, 5000); // Check every 5 seconds

    socket.on('disconnect', () => {
      clearInterval(hintCheckInterval);
    });
  });

  // Handle filter change from leaderboard page
  socket.on('filter-changed', (data) => {
    const { timeFilter } = data;
    if (timeFilter) {
      console.log(`🔄 Filter changed to: ${timeFilter}`);
      // Broadcast filter change to all connected clients
      io.emit('filter-changed', { timeFilter });
    }
  });

  // Handle leaderboard filter change
  socket.on('request-leaderboard', async (data) => {
    const { timeFilter, sessionId } = data;
    if (timeFilter) {
      currentTimeFilter = timeFilter;
      console.log(`📊 Leaderboard filter changed to: ${timeFilter}, sessionId: ${sessionId}`);
      
      const PointsLog = require('./models/PointsLog');
      const leaderboard = await PointsLog.getLeaderboard(timeFilter, sessionId);
      socket.emit('leaderboard-update', leaderboard);
    }
  });

  // Check TikTok Live status periodically
  socket.on('check-tiktok-status', () => {
    if (!tiktokStatus.isConnected) {
      console.log('⚠️ TikTok Live appears disconnected');
      socket.emit('tiktok-status', { status: 'disconnected' });
    } else {
      socket.emit('tiktok-status', { status: 'connected', username: tiktokStatus.username });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start server
const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    server.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════╗
║  🎮 TikTok Live Quiz Server Started    ║
║  Server: http://${HOST}:${PORT}         ║
║  Socket.io: ws://${HOST}:${PORT}        ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  TiktokService.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

start();

module.exports = { app, io };
