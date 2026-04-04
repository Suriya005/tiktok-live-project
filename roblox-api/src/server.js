const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');

// Import routes
const robloxRoutes = require('./routes/roblox');
const gameEventsRoutes = require('./routes/gameEvents');
const eventQueueRoutes = require('./routes/eventQueue');
const healthRoutes = require('./routes/health');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Create Express app
const app = express();

// Trust proxy - สำหรับ ngrok และ reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: config.cors.allowedOrigins === '*' 
    ? '*' 
    : (origin, callback) => {
        if (!origin || config.cors.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
  credentials: true,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging middleware (development)
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(rateLimiter);

// Health check
app.use('/health', healthRoutes);

// API routes
app.use(`/api/${config.apiVersion}/roblox`, robloxRoutes);
app.use(`/api/${config.apiVersion}/game-events`, gameEventsRoutes);
app.use(`/api/${config.apiVersion}/event-queue`, eventQueueRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Roblox API Server',
    version: config.apiVersion,
    endpoints: {
      health: '/health',
      roblox: `/api/${config.apiVersion}/roblox`,
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎮 Roblox API Server Running                           ║
║                                                           ║
║   Environment: ${config.env.padEnd(42)}║
║   Port:        ${config.port.toString().padEnd(42)}║
║   API Version: ${config.apiVersion.padEnd(42)}║
║                                                           ║
║   Health:      http://localhost:${config.port}/health${' '.repeat(18)}║
║   API:         http://localhost:${config.port}/api/${config.apiVersion}${' '.repeat(14)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
