const express = require('express');
const helmet = require('helmet'); // ใช้เพื่อเพิ่มความปลอดภัยของ HTTP headers
const cors = require('cors'); // ใช้เพื่อจัดการ CORS
const morgan = require('morgan'); // ใช้เพื่อ logging requests (เฉพาะในโหมดพัฒนา)
const cookieParser = require('cookie-parser'); // ใช้เพื่อ parsing cookies จาก requests 
const config = require('./config/config');
const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./utils/errors');
const winston = require('winston');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Create Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      if (config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Logging middleware (only in development)
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth API is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}`, userRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Logger configuration
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console()
  ]
});

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Auth API Server Running                             ║
║                                                           ║
║   Environment: ${config.env.padEnd(42)}║
║   Port:        ${PORT.toString().padEnd(42)}║
║   API Version: ${config.apiVersion.padEnd(42)}║
║                                                           ║
║   Health:      http://localhost:${PORT}/health${' '.repeat(18)}║
║   API Base:    http://localhost:${PORT}/api/${config.apiVersion}${' '.repeat(14)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', { error: err.stack || err });
  server.close(() => process.exit(1));
  
  // ถ้า server ไม่ปิดภายใน 10 วินาที ให้ force exit
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
