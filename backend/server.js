const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database configuration
const { testConnection, initializeDatabase } = require('./config/database');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const apiRoutes = require('./routes');

// Create Express app
const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint (before API routes)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SmartSpend Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler for unknown routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your database configuration.');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('🚀 SmartSpend Backend Server Started');
      console.log('=====================================');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log('=====================================');
      
      if (NODE_ENV === 'development') {
        console.log('\n🔧 Development Mode Features:');
        console.log('   • Request logging enabled');
        console.log('   • Detailed error messages');
        console.log('   • Auto-verification for new users');
        console.log('   • Password reset tokens in response');
        console.log('\n💡 Quick Start:');
        console.log('   1. Make sure your MySQL database is running');
        console.log('   2. Copy .env.example to .env and configure');
        console.log('   3. Test with: curl http://localhost:' + PORT + '/api/health');
        console.log('\n');
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;