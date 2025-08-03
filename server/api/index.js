const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const authRoutes = require('../routes/auth');
const courseRoutes = require('../routes/courses');
const moduleRoutes = require('../routes/modules');
const lessonRoutes = require('../routes/lessons');
const progressRoutes = require('../routes/progress');
const youtubeRoutes = require('../routes/youtube');

// MongoDB connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && cachedDb.readyState === 1) {
    return cachedDb;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    console.log('Connected to MongoDB');
    cachedDb = mongoose.connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Create Express app
const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Text-to-Learn API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: cachedDb ? 'connected' : 'disconnected'
  });
});

app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/modules', moduleRoutes);
app.use('/lessons', lessonRoutes);
app.use('/progress', progressRoutes);
app.use('/youtube', youtubeRoutes);

// Error handlers
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

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  });
});

// Export the serverless function
module.exports = async (req, res) => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Handle the request
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