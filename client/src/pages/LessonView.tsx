import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { InlineLoader } from '../components/ui/LoadingSpinner';
import { NotFoundError } from '../components/ui/ErrorMessage';
import { LessonRenderer } from '../components/LessonRenderer';
import { Progress } from '../components/ui/progress';
import { lessonAPI } from '../services/api';

type ContentBlock = 
  | { type: 'heading'; text: string; level?: 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; language: string; text: string }
  | { type: 'video'; url: string; title?: string; description?: string }
  | { type: 'mcq'; question: string; options: string[]; answer: number; explanation?: string };

interface LessonData {
  id: string;
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
        
        const response = await lessonAPI.getLesson(courseId, parseInt(moduleIndex), parseInt(lessonIndex));
        
        if (response.success && response.data) {
          setLesson(response.data);
        } else {
          setError(response.error?.message || 'Failed to load lesson');
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
  
  const prevLessonUrl = prevLessonExists 
    ? `/courses/${courseId}/module/${moduleIndex}/lesson/${parseInt(lessonIndex) - 1}`
    : null;
    
  const nextLessonUrl = nextLessonExists 
    ? `/courses/${courseId}/module/${moduleIndex}/lesson/${parseInt(lessonIndex) + 1}`
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
                <Button>
                  Next Lesson
                  <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            ) : (
              <Button disabled>
                Course Complete
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};