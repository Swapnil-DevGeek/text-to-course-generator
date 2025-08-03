import React, { useState, useEffect } from 'react';
import { youtubeAPI } from '../../services/api';
import { type VideoBlockData } from '../../types/lesson';

interface VideoBlockProps {
  block: VideoBlockData;
}

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  embedUrl: string;
  watchUrl: string;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ block }) => {
  const { url, searchQuery, title, description } = block;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [youtubeVideo, setYoutubeVideo] = useState<YouTubeVideo | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const getEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  const isEmbeddableUrl = (url: string): boolean => {
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('vimeo.com') ||
           url.includes('embed');
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Fetch YouTube video when searchQuery is provided
  useEffect(() => {
    const fetchYouTubeVideo = async () => {
      if (!searchQuery || url) {
        // Don't search if we already have a URL or no search query
        return;
      }

      try {
        setIsSearching(true);
        setSearchError(null);
        setShowFallback(false);

        console.log(`Searching YouTube for: "${searchQuery}"`);
        
        const response = await youtubeAPI.searchVideos(searchQuery, {
          maxResults: 1,
          duration: 'medium'
        });

        if (response.success && response.data?.videos?.length > 0) {
          const video = response.data.videos[0];
          setYoutubeVideo(video);
          console.log(`Found YouTube video: ${video.title}`);
        } else {
          setSearchError('No videos found for this search query');
          setShowFallback(true);
        }

      } catch (error: any) {
        console.error('YouTube search error:', error);
        
        // Handle different error scenarios
        if (error?.response?.data?.error?.fallback) {
          setSearchError('YouTube service temporarily unavailable');
        } else {
          setSearchError('Failed to search for videos');
        }
        
        setShowFallback(true);
      } finally {
        setIsSearching(false);
      }
    };

    fetchYouTubeVideo();
  }, [searchQuery, url]);

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Handle search query case (AI-generated content with YouTube integration)
  if (searchQuery && !url) {
    // Show fetched YouTube video if available
    if (youtubeVideo && !showFallback) {
      return (
        <div className="mb-6">
          {title && (
            <h4 className="text-lg font-medium text-gray-900 mb-2">{title}</h4>
          )}
          {description && (
            <p className="text-sm text-gray-600 mb-3">{description}</p>
          )}
          
          {/* YouTube Video Info */}
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 text-sm">{youtubeVideo.title}</h5>
            <p className="text-xs text-gray-600 mt-1">by {youtubeVideo.channelTitle}</p>
          </div>

          {/* Video Embed */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            {hasError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Failed to load video</p>
                  <a 
                    href={youtubeVideo.watchUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>
            ) : (
              <iframe
                src={youtubeVideo.embedUrl}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allowFullScreen
                onLoad={handleVideoLoad}
                onError={handleVideoError}
                title={youtubeVideo.title}
              />
            )}
          </div>
        </div>
      );
    }

    // Show loading state while searching
    if (isSearching) {
      return (
        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-blue-900">
                🔍 Finding Video Content
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Searching for "{searchQuery}"...
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Show fallback options if search failed or no video found
    return (
      <div className="mb-6 p-4 border border-orange-200 rounded-lg bg-orange-50">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-medium text-orange-900">
              📺 {title || 'Recommended Video'}
            </h4>
            {description && (
              <p className="text-sm text-orange-700 mt-1">{description}</p>
            )}
            
            {searchError && (
              <div className="mt-2 p-2 bg-orange-100 rounded text-sm">
                <p className="text-orange-800 font-medium">⚠️ {searchError}</p>
              </div>
            )}

            <div className="mt-2 p-2 bg-orange-100 rounded text-sm">
              <p className="text-orange-800 font-medium mb-1">Search manually:</p>
              <p className="text-orange-700 italic">"{searchQuery}"</p>
            </div>
            
            <div className="flex space-x-2 mt-3">
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-orange-600 bg-white border border-orange-300 rounded-md hover:bg-orange-50"
              >
                Search YouTube
                <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' video tutorial')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-orange-600 bg-white border border-orange-300 rounded-md hover:bg-orange-50"
              >
                Search Google
                <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle direct URL case (existing functionality)
  if (url && !isEmbeddableUrl(url)) {
    return (
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m2-7V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-medium text-gray-900">
              {title || 'Video Resource'}
            </h4>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Watch Video
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // No URL or search query provided
  if (!url) {
    return null;
  }

  return (
    <div className="mb-6">
      {title && (
        <h4 className="text-lg font-medium text-gray-900 mb-2">{title}</h4>
      )}
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Failed to load video</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Open in new tab
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={getEmbedUrl(url)}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            frameBorder="0"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
            title={title || 'Video content'}
          />
        )}
      </div>
    </div>
  );
};