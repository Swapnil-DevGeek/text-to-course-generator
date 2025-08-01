import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'white';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  text,
  className = '',
  variant = 'primary'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      case 'xl': return 'h-16 w-16';
      default: return 'h-8 w-8';
    }
  };

  const getColorClasses = () => {
    switch (variant) {
      case 'primary': return 'border-blue-500';
      case 'secondary': return 'border-gray-500';
      case 'white': return 'border-white';
      default: return 'border-blue-500';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${getSizeClasses()} ${getColorClasses()}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className={`mt-2 text-gray-600 ${getTextSizeClasses()}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Global loading overlay component
export const LoadingOverlay: React.FC<{ isLoading: boolean; text?: string }> = ({ 
  isLoading, 
  text = 'Loading...' 
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

// Inline loading state for components
export const InlineLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="md" text={text} />
  </div>
);