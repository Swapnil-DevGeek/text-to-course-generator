import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { NotFoundError } from '../components/ui/ErrorMessage';
import { LessonRenderer } from '../components/LessonRenderer';
import { Progress } from '../components/ui/progress';
import { ReactPDFLessonExporter } from '../components/pdf/ReactPDFLessonExporter';
import { lessonAPI, progressAPI } from '../services/api';
import { type ContentBlock } from '../types/lesson';

// API Content Block format (what the API returns)
type APIContentBlock = 
  | { type: 'heading'; content: string; metadata?: { level?: 1 | 2 | 3 | 4 | 5 | 6 }; order: number }
  | { type: 'paragraph'; content: string; order: number }
  | { type: 'code'; content: string; metadata?: { language?: string }; order: number }
  | { type: 'video'; content: { searchQuery?: string; title?: string; description?: string; url?: string }; order: number }
  | { type: 'quiz'; content: { question: string; options: string[]; correctAnswer: number; explanation?: string }; order: number }
  | { type: 'mcq'; content: { question: string; options: string[]; correctAnswer: number; explanation?: string }; order: number };

// Transform API content blocks to frontend format
const transformContentBlocks = (apiBlocks: APIContentBlock[]): ContentBlock[] => {
  return apiBlocks.map(block => {
    switch (block.type) {
      case 'heading':
        return {
          type: 'heading',
          text: block.content,
          level: block.metadata?.level || 2
        };
      case 'paragraph':
        return {
          type: 'paragraph',
          text: block.content
        };
      case 'code':
        return {
          type: 'code',
          text: block.content,
          language: block.metadata?.language || 'text'
        };
      case 'video':
        return {
          type: 'video',
          url: block.content.url || '',
          title: block.content.title,
          description: block.content.description,
          searchQuery: block.content.searchQuery
        };
      case 'quiz':
      case 'mcq':
        return {
          type: 'mcq',
          question: block.content.question,
          options: block.content.options,
          answer: block.content.correctAnswer,
          explanation: block.content.explanation
        };
      default:
        // Fallback for unknown types
        return {
          type: 'paragraph',
          text: `Unknown content type: ${(block as any).type}`
        };
    }
  });
};

// API Lesson Data format
interface APILessonData {
  _id: string;
  title: string;
  description: string;
  content: APIContentBlock[];
  estimatedDuration?: string;
  completed?: boolean;
  courseId: string;
  courseName: string;
  moduleIndex: number;
  lessonIndex: number;
  totalModules: number;
  totalLessonsInModule: number;
  moduleTitle: string;
}

// Frontend Lesson Data format
interface LessonData {
  _id: string;
  title: string;
  description: string;
  content: ContentBlock[];
  estimatedDuration?: string;
  completed?: boolean;
  courseId: string;
  courseName: string;
  moduleIndex: number;
  lessonIndex: number;
  totalModules: number;
  totalLessonsInModule: number;
  moduleTitle: string;
}

export const LessonView: React.FC = () => {
  const { courseId, moduleIndex, lessonIndex } = useParams<{
    courseId: string;
    moduleIndex: string;
    lessonIndex: string;
  }>();
  
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [showModuleCompletion, setShowModuleCompletion] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const fetchLesson = async () => {
      if (!courseId || moduleIndex === undefined || lessonIndex === undefined) {
        setError('Invalid lesson parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const [lessonResponse, progressResponse] = await Promise.all([
          lessonAPI.getLesson(courseId, parseInt(moduleIndex), parseInt(lessonIndex)),
          progressAPI.getDetailedCourseProgress(courseId)
        ]);
        
        if (lessonResponse.success && lessonResponse.data) {
          // Transform API data to frontend format
          const apiLesson = lessonResponse.data as APILessonData;
          const transformedLesson: LessonData = {
            ...apiLesson,
            content: transformContentBlocks(apiLesson.content)
          };
          setLesson(transformedLesson);
          setStartTime(Date.now());
          
          // Update current position
          await progressAPI.updateCurrentPosition(courseId, parseInt(moduleIndex), parseInt(lessonIndex));
        } else {
          setError(lessonResponse.error?.message || 'Failed to load lesson');
        }

        // Check if this lesson is already completed
        if (progressResponse.success && progressResponse.data) {
          const currentModule = progressResponse.data.modules[parseInt(moduleIndex)];
          const currentLesson = currentModule?.lessons[parseInt(lessonIndex)];
          setIsCompleted(currentLesson?.isCompleted || false);
          setModuleCompleted(currentModule?.isCompleted || false);
        }
      } catch (err: any) {
        console.error('Error fetching lesson:', err);
        const errorMessage = err?.response?.data?.error?.message || 
                            err?.message || 
                            'Failed to load lesson';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, moduleIndex, lessonIndex]);

  const handleCompleteLesson = async () => {
    if (!lesson || !courseId || isCompleted) return;

    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // Time in minutes
      const response = await progressAPI.completeLesson(courseId, lesson._id, timeSpent);
      
      if (response.success) {
        setIsCompleted(true);
        
        // Check if module was completed
        if (response.data.moduleCompleted && response.data.newlyCompleted) {
          setModuleCompleted(true);
          setShowModuleCompletion(true);
        }
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  if (!courseId || moduleIndex === undefined || lessonIndex === undefined) {
    return <Navigate to="/courses" replace />;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-4">
            <svg fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading lesson...</h3>
          <p className="text-gray-500">
            {lesson ? 'Preparing content...' : 'This may take a moment if AI is generating content for the first time.'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <NotFoundError 
          resource="lesson"
          onGoBack={() => window.history.back()}
        />
      </div>
    );
  }

  const prevLessonExists = parseInt(lessonIndex) > 0;
  const nextLessonExists = parseInt(lessonIndex) < lesson.totalLessonsInModule - 1;
  const nextModuleExists = parseInt(moduleIndex) < lesson.totalModules - 1;
  
  const prevLessonUrl = prevLessonExists 
    ? `/courses/${courseId}/module/${moduleIndex}/lesson/${parseInt(lessonIndex) - 1}`
    : null;
    
  const nextLessonUrl = nextLessonExists 
    ? `/courses/${courseId}/module/${moduleIndex}/lesson/${parseInt(lessonIndex) + 1}`
    : null;

  const nextModuleUrl = nextModuleExists 
    ? `/courses/${courseId}/module/${parseInt(moduleIndex) + 1}/lesson/0`
    : null;

  const courseUrl = `/courses/${courseId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lesson Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={courseUrl}>
                <Button variant="ghost" size="sm">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Course
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {lesson.title}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <span>{lesson.courseName}</span>
                  <span>•</span>
                  <span>Module {lesson.moduleIndex + 1}</span>
                  <span>•</span>
                  <span>Lesson {lesson.lessonIndex + 1}</span>
                  {lesson.estimatedDuration && (
                    <>
                      <span>•</span>
                      <span>{lesson.estimatedDuration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ReactPDFLessonExporter 
                lesson={lesson}
                variant="outline"
                size="sm"
              />
              <Progress 
                value={((lesson.lessonIndex + 1) / lesson.totalLessonsInModule) * 100}
                className="w-32"
              />
              <Badge variant="outline">
                {lesson.lessonIndex + 1} / {lesson.totalLessonsInModule}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-white">
          <CardContent className="p-8">
            <LessonRenderer content={lesson.content} />
          </CardContent>
        </Card>

        {/* Lesson Completion */}
        <div className="mt-8 text-center">
          <Button 
            onClick={handleCompleteLesson}
            disabled={isCompleted}
            size="lg"
            className={isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isCompleted ? (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lesson Completed
              </>
            ) : (
              'Mark as Complete'
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <div>
            {prevLessonUrl ? (
              <Link to={prevLessonUrl}>
                <Button variant="outline">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Lesson
                </Button>
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          <Link to={courseUrl}>
            <Button variant="ghost">
              Course Overview
            </Button>
          </Link>

          <div>
            {nextLessonUrl ? (
              <Link to={nextLessonUrl}>
                <Button disabled={!isCompleted}>
                  Next Lesson
                  <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            ) : moduleCompleted && nextModuleUrl ? (
              <Link to={nextModuleUrl}>
                <Button>
                  Next Module
                  <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            ) : (
              <Button disabled>
                {moduleCompleted ? 'Course Complete' : 'Complete Module First'}
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            )}
          </div>
        </div>

        {/* Module Completion Modal */}
        {showModuleCompletion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Module Complete!</h3>
                <p className="text-gray-600 mb-6">
                  Congratulations! You've completed "{lesson.moduleTitle}". 
                  {nextModuleUrl ? ' Ready to move on to the next module?' : ' You\'ve finished the entire course!'}
                </p>
                <div className="flex space-x-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowModuleCompletion(false)}
                  >
                    Stay Here
                  </Button>
                  {nextModuleUrl ? (
                    <Link to={nextModuleUrl}>
                      <Button onClick={() => setShowModuleCompletion(false)}>
                        Next Module
                      </Button>
                    </Link>
                  ) : (
                    <Link to={courseUrl}>
                      <Button onClick={() => setShowModuleCompletion(false)}>
                        Course Overview
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};