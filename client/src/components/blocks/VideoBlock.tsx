import React, { useState } from 'react';

interface VideoBlockData {
  type: 'video';
  url: string;
  title?: string;
  description?: string;
}

interface VideoBlockProps {
  block: VideoBlockData;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ block }) => {
  const { url, title, description } = block;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  if (!isEmbeddableUrl(url)) {
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