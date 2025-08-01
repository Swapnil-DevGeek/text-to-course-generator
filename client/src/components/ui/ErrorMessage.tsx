import React from 'react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  className?: string;
  showIcon?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try Again',
  variant = 'destructive',
  className = '',
  showIcon = true
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <Alert variant={variant} className={className}>
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-sm font-medium">
            {title}
          </AlertTitle>
          <AlertDescription className="mt-1 text-sm">
            {message}
          </AlertDescription>
          {onRetry && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="text-sm"
              >
                {retryText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

// Specialized error components for common use cases
export const APIErrorMessage: React.FC<{
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}> = ({ error, onRetry, className }) => {
  const message = typeof error === 'string' ? error : error.message;
  
  return (
    <ErrorMessage
      title="API Error"
      message={message}
      onRetry={onRetry}
      variant="destructive"
      className={className}
    />
  );
};

export const NetworkErrorMessage: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <ErrorMessage
    title="Network Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    variant="destructive"
    className={className}
  />
);

export const NotFoundError: React.FC<{
  resource?: string;
  onGoBack?: () => void;
  className?: string;
}> = ({ resource = 'page', onGoBack, className }) => (
  <ErrorMessage
    title="Not Found"
    message={`The ${resource} you're looking for doesn't exist or has been moved.`}
    onRetry={onGoBack}
    retryText="Go Back"
    variant="warning"
    className={className}
  />
);

// Full page error component
export const ErrorPage: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({ 
  title = 'Oops! Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  onRetry 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full px-6">
      <div className="text-center mb-8">
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{message}</p>
      </div>
      
      {onRetry && (
        <div className="text-center">
          <Button onClick={onRetry} size="lg" className="w-full">
            Try Again
          </Button>
        </div>
      )}
    </div>
  </div>
);