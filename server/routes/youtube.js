const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Search for videos
router.get('/search', youtubeController.searchVideos);

// Get video details by ID
router.get('/video/:videoId', youtubeController.getVideoDetails);

// Cache management routes (for debugging/admin)
router.get('/cache/stats', youtubeController.getCacheStats);
router.delete('/cache', youtubeController.clearCache);

module.exports = router;