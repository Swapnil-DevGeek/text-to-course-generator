const fetch = require('node-fetch');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.cache = new Map(); // In-memory cache
    this.cacheExpirationMinutes = 60; // 1 hour cache
  }

  /**
   * Initialize the service and validate API key
   */
  initialize() {
    if (!this.apiKey) {
      console.warn('YouTube API key not found. Video search will be disabled.');
      return false;
    }
    console.log('YouTube service initialized successfully');
    return true;
  }

  /**
   * Generate cache key for a search query
   */
  getCacheKey(query, options = {}) {
    return `youtube_${query}_${JSON.stringify(options)}`.replace(/\s+/g, '_').toLowerCase();
  }

  /**
   * Check if cached result is still valid
   */
  isCacheValid(timestamp) {
    const now = Date.now();
    const expirationTime = this.cacheExpirationMinutes * 60 * 1000;
    return (now - timestamp) < expirationTime;
  }

  /**
   * Get cached result if available and valid
   */
  getCachedResult(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log(`YouTube cache hit for key: ${cacheKey}`);
      return cached.data;
    }
    
    if (cached) {
      // Remove expired cache entry
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Cache search result
   */
  setCachedResult(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    // Cleanup old cache entries (simple LRU implementation)
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Sanitize and validate search query
   */
  sanitizeQuery(query) {
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid search query');
    }

    // Remove potentially harmful characters
    const sanitized = query
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/[{}]/g, '') // Remove braces
      .substring(0, 200); // Limit length

    if (sanitized.length < 3) {
      throw new Error('Search query must be at least 3 characters long');
    }

    return sanitized;
  }

  /**
   * Build YouTube API search URL
   */
  buildSearchUrl(query, options = {}) {
    const params = new URLSearchParams({
      part: 'id,snippet',
      q: query,
      type: 'video',
      videoEmbeddable: 'true',
      videoDuration: options.duration || 'medium', // short (<4min), medium (4-20min), long (>20min)
      maxResults: options.maxResults || 3,
      order: options.order || 'relevance',
      relevanceLanguage: options.language || 'en',
      safeSearch: 'moderate',
      key: this.apiKey
    });

    return `${this.baseUrl}/search?${params.toString()}`;
  }

  /**
   * Process YouTube API response
   */
  processSearchResponse(data) {
    if (!data.items || data.items.length === 0) {
      return {
        success: false,
        error: 'No videos found for the search query'
      };
    }

    const videos = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    return {
      success: true,
      data: {
        videos,
        totalResults: data.pageInfo.totalResults,
        primary: videos[0] // First video as primary choice
      }
    };
  }

  /**
   * Search for videos on YouTube
   */
  async searchVideos(query, options = {}) {
    try {
      // Validate API key availability
      if (!this.apiKey) {
        return {
          success: false,
          error: 'YouTube API key not configured',
          fallback: true
        };
      }

      // Sanitize query
      const sanitizedQuery = this.sanitizeQuery(query);
      const cacheKey = this.getCacheKey(sanitizedQuery, options);

      // Check cache first
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Build search URL
      const searchUrl = this.buildSearchUrl(sanitizedQuery, options);
      
      console.log(`Searching YouTube for: "${sanitizedQuery}"`);

      // Make API request
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle quota exceeded
        if (response.status === 403 && errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
          console.error('YouTube API quota exceeded');
          return {
            success: false,
            error: 'YouTube API quota exceeded',
            fallback: true
          };
        }

        throw new Error(`YouTube API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const result = this.processSearchResponse(data);

      // Cache successful results
      if (result.success) {
        this.setCachedResult(cacheKey, result);
      }

      return result;

    } catch (error) {
      console.error('YouTube search error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to search videos',
        fallback: true
      };
    }
  }

  /**
   * Get video details by ID
   */
  async getVideoDetails(videoId) {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'YouTube API key not configured'
        };
      }

      const url = `${this.baseUrl}/videos?part=snippet,contentDetails&id=${videoId}&key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          error: 'Video not found'
        };
      }

      const video = data.items[0];
      return {
        success: true,
        data: {
          videoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          duration: video.contentDetails.duration,
          thumbnail: video.snippet.thumbnails.medium?.url,
          channelTitle: video.snippet.channelTitle,
          embedUrl: `https://www.youtube.com/embed/${video.id}`,
          watchUrl: `https://www.youtube.com/watch?v=${video.id}`
        }
      };

    } catch (error) {
      console.error('YouTube video details error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get video details'
      };
    }
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
    console.log('YouTube service cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create and export singleton instance
const youtubeService = new YouTubeService();
module.exports = youtubeService;