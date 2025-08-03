require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');

// Import middleware
const { generalLimiter } = require('../middleware/rateLimiter');

// Import routes
const authRoutes = require('../routes/auth');
const courseRoutes = require('../routes/courses');
const moduleRoutes = require('../routes/modules');
const lessonRoutes = require('../routes/lessons');
const progressRoutes = require('../routes/progress');
const youtubeRoutes = require('../routes/youtube');

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport middleware
app.use(passport.initialize());

// Initialize services
const youtubeService = require('../services/youtubeService');

// MongoDB connection with connection pooling for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    console.log('Connected to MongoDB');
    
    // Initialize YouTube service
    youtubeService.initialize();
    
    cachedDb = connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Text-to-Learn API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      modules: '/api/modules',
      lessons: '/api/lessons',
      progress: '/api/progress',
      youtube: '/api/youtube',
      health: '/api/health'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/youtube', youtubeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'ROUTE_NOT_FOUND',
      path: req.originalUrl
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      }
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        message: `${field} already exists`,
        code: 'DUPLICATE_FIELD',
        field: field
      }
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  });
});

// Serverless function handler
module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Database connection failed',
        code: 'DB_CONNECTION_ERROR'
      }
    });
  }
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`MongoDB URI: ${MONGODB_URI}`);
    });
  });
}