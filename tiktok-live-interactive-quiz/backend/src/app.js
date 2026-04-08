require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const logger = require('./utils/logger');
const errorMiddleware = require('./middlewares/error.middleware');

const healthRoute = require('./modules/health/health.route');
const questionRoute = require('./modules/questions/question.route');
const quizRoute = require('./modules/quiz/quiz.route');
const leaderboardRoute = require('./modules/leaderboard/leaderboard.route');

const quizService = require('./modules/quiz/quiz.service');
const tiktokAdapter = require('./adapters/tiktok.adapter');
const leaderboardRepository = require('./modules/leaderboard/leaderboard.repository');

// --- Express Setup ---
const app = express();
const server = createServer(app);

// --- Socket.io Setup ---
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/health', healthRoute);
app.use('/api/questions', questionRoute);
app.use('/api/quiz', quizRoute);
app.use('/api/leaderboard', leaderboardRoute);

// --- Error Handler ---
app.use(errorMiddleware);

// --- Initialize Services with Socket.io ---
quizService.initialize(io);
tiktokAdapter.initialize(io);

// --- Global TikTok Status ---
let tiktokStatus = { isConnected: false, username: null };

// --- Socket.io Events ---
io.on('connection', (socket) => {
  logger.info('[Socket] Client connected', { socketId: socket.id });

  // TikTok Live Connection
  socket.on('connect-tiktok', async ({ username }) => {
    logger.info('[Socket] connect-tiktok', { username });
    const result = await tiktokAdapter.connectToLive(username);
    socket.emit('tiktok-connection-result', result);

    if (result.success) {
      tiktokStatus = { isConnected: true, username };
      io.emit('tiktok-connected', { status: 'connected', username, timestamp: new Date() });
    }
  });

  socket.on('disconnect-tiktok', () => {
    tiktokAdapter.disconnect();
    tiktokStatus = { isConnected: false, username: null };
    io.emit('tiktok-disconnected', { timestamp: new Date() });
  });

  // Session Management
  socket.on('set-session', ({ sessionId }) => {
    quizService.setSessionId(sessionId);
    logger.info('[Socket] Session set', { sessionId });
    io.emit('session-set', { sessionId });
  });

  socket.on('get-current-session', () => {
    socket.emit('session-set', { sessionId: quizService.getSessionId() });
  });

  // Hint Monitoring
  socket.on('monitor-hint', () => {
    const hintInterval = setInterval(async () => {
      const result = await quizService.checkHintCondition();
      socket.emit('hint-status', result);
    }, 5000);

    socket.on('disconnect', () => clearInterval(hintInterval));
  });

  // Leaderboard
  socket.on('filter-changed', ({ timeFilter }) => {
    if (timeFilter) {
      logger.info('[Socket] filter-changed', { timeFilter });
      io.emit('filter-changed', { timeFilter });
    }
  });

  socket.on('request-leaderboard', async ({ timeFilter, sessionId }) => {
    if (!timeFilter) return;
    try {
      const leaderboard = await leaderboardRepository.getLeaderboard(timeFilter, sessionId);
      socket.emit('leaderboard-update', leaderboard);
    } catch (err) {
      logger.error('[Socket] request-leaderboard failed', { err: err.message });
    }
  });

  // TikTok Status Check
  socket.on('check-tiktok-status', () => {
    const status = tiktokStatus.isConnected ? 'connected' : 'disconnected';
    socket.emit('tiktok-status', { status, username: tiktokStatus.username });
  });

  socket.on('disconnect', () => {
    logger.info('[Socket] Client disconnected', { socketId: socket.id });
  });
});

module.exports = { app, server, io };
