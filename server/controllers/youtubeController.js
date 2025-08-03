const youtubeService = require('../services/youtubeService');

/**
 * Search for videos on YouTube
 */
exports.searchVideos = async (req, res) => {
  try {
    const { query, maxResults = 3, duration = 'medium', language = 'en' } = req.query;

    // Validate query parameter
    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Search query is required',
          code: 'MISSING_QUERY'
        }
      });
    }

    // Search options
    const options = {
      maxResults: Math.min(parseInt(maxResults) || 3, 10), // Limit to 10 max
      duration,
      language
    };

    // Search videos
    const result = await youtubeService.searchVideos(query, options);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      // Handle fallback cases (API key missing, quota exceeded, etc.)
      const statusCode = result.fallback ? 503 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          code: result.fallback ? 'SERVICE_UNAVAILABLE' : 'SEARCH_FAILED',
          fallback: result.fallback || false
        }
      });
    }

  } catch (error) {
    console.error('YouTube search controller error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during video search',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Get video details by ID
 */
exports.getVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Video ID is required',
          code: 'MISSING_VIDEO_ID'
        }
      });
    }

    const result = await youtubeService.getVideoDetails(videoId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        error: {
          message: result.error,
          code: 'VIDEO_NOT_FOUND'
        }
      });
    }

  } catch (error) {
    console.error('YouTube video details controller error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while fetching video details',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Get cache statistics (for debugging/monitoring)
 */
exports.getCacheStats = async (req, res) => {
  try {
    const stats = youtubeService.getCacheStats();
    
    res.json({
      success: true,
      data: {
        cacheSize: stats.size,
        apiKeyConfigured: !!process.env.YOUTUBE_API_KEY,
        cacheKeys: stats.keys.slice(0, 10) // Show first 10 keys only
      }
    });

  } catch (error) {
    console.error('YouTube cache stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get cache statistics',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Clear cache (for debugging/admin use)
 */
exports.clearCache = async (req, res) => {
  try {
    youtubeService.clearCache();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });

  } catch (error) {
    console.error('YouTube clear cache error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to clear cache',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};