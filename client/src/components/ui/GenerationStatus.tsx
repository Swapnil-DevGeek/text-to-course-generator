import React from 'react';
import { Card, CardContent } from './card';
import { Progress } from './progress';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { Button } from './button';
// Define GenerationStatus type locally since it's a UI-specific type
interface GenerationStatusType {
  isGenerating: boolean;
  progress?: number;
  currentStep?: string;
  error?: string;
}

interface GenerationStatusProps {
  status: GenerationStatusType;
  onRetry?: () => void;
  onCancel?: () => void;
  type?: 'course' | 'lesson';
}

export const GenerationStatus: React.FC<GenerationStatusProps> = ({
  status,
  onRetry,
  onCancel,
  type = 'course'
}) => {
  const { isGenerating, progress, currentStep, error } = status;

  if (!isGenerating && !error) {
    return null;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <ErrorMessage
            title={`${type === 'course' ? 'Course' : 'Lesson'} Generation Failed`}
            message={error}
            onRetry={onRetry}
            variant="destructive"
            className="border-none bg-transparent p-0"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <LoadingSpinner size="md" variant="primary" />
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Generating {type === 'course' ? 'Course' : 'Lesson Content'}...
            </h3>
            
            {currentStep && (
              <p className="text-blue-700 mb-3 text-sm">
                {currentStep}
              </p>
            )}

            {progress !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-blue-700 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="bg-blue-100" />
              </div>
            )}

            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-blue-600">
                <svg className="animate-pulse h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                AI is working on your {type}...
              </div>
              
              {onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Specialized components for different generation types
export const CourseGenerationStatus: React.FC<{
  isGenerating: boolean;
  error?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}> = ({ isGenerating, error, onRetry, onCancel }) => {
  const status: GenerationStatusType = {
    isGenerating,
    error,
    currentStep: isGenerating ? 'Analyzing topic and creating course structure...' : undefined,
    progress: isGenerating ? undefined : 0
  };

  return (
    <GenerationStatus
      status={status}
      onRetry={onRetry}
      onCancel={onCancel}
      type="course"
    />
  );
};

export const LessonGenerationStatus: React.FC<{
  isGenerating: boolean;
  error?: string;
  currentLesson?: string;
  progress?: number;
  onRetry?: () => void;
  onCancel?: () => void;
}> = ({ isGenerating, error, currentLesson, progress, onRetry, onCancel }) => {
  const status: GenerationStatusType = {
    isGenerating,
    error,
    currentStep: currentLesson ? `Generating lesson: ${currentLesson}` : 'Generating lesson content...',
    progress
  };

  return (
    <GenerationStatus
      status={status}
      onRetry={onRetry}
      onCancel={onCancel}
      type="lesson"
    />
  );
};

// Success notification component
export const GenerationSuccess: React.FC<{
  type: 'course' | 'lesson';
  title: string;
  onViewResult?: () => void;
  onCreateAnother?: () => void;
}> = ({ type, title, onViewResult, onCreateAnother }) => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-green-900 mb-2">
              {type === 'course' ? 'Course' : 'Lesson'} Generated Successfully!
            </h3>
            <p className="text-green-700 mb-4">
              "{title}" has been created and is ready to use.
            </p>

            <div className="flex items-center space-x-3">
              {onViewResult && (
                <Button
                  onClick={onViewResult}
                  className="bg-green-600 hover:bg-green-700"
                >
                  View {type === 'course' ? 'Course' : 'Lesson'}
                </Button>
              )}
              
              {onCreateAnother && (
                <Button
                  variant="outline"
                  onClick={onCreateAnother}
                  className="text-green-600 border-green-300 hover:bg-green-100"
                >
                  Create Another
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};