import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { InlineLoader } from '../components/ui/LoadingSpinner';
import { NotFoundError } from '../components/ui/ErrorMessage';
import { LessonRenderer } from '../components/LessonRenderer';
import { Progress } from '../components/ui/progress';

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
        
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock lesson data
        const mockLesson: LessonData = {
          id: `${courseId}-${moduleIndex}-${lessonIndex}`,
          title: 'Introduction to Artificial Intelligence',
          description: 'Learn the fundamental concepts of AI and how it impacts our daily lives.',
          courseId,
          courseName: 'AI Fundamentals Course',
          moduleIndex: parseInt(moduleIndex),
          lessonIndex: parseInt(lessonIndex),
          totalModules: 3,
          totalLessonsInModule: 4,
          moduleTitle: 'AI Basics',
          estimatedDuration: '30 minutes',
          completed: false,
          content: [
            {
              type: 'heading',
              text: 'What is Artificial Intelligence?',
              level: 1
            },
            {
              type: 'paragraph',
              text: 'Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines that work and react like humans. It encompasses various subfields including machine learning, natural language processing, computer vision, and robotics.'
            },
            {
              type: 'heading',
              text: 'Key Concepts',
              level: 2
            },
            {
              type: 'paragraph',
              text: 'Before diving deeper into AI, let\'s understand some fundamental concepts:'
            },
            {
              type: 'code',
              language: 'python',
              text: `# Simple AI decision making example
def ai_decision(input_data):
    if input_data > 0.7:
        return "high_confidence"
    elif input_data > 0.3:
        return "medium_confidence"
    else:
        return "low_confidence"

# Example usage
result = ai_decision(0.85)
print(f"AI Decision: {result}")`
            },
            {
              type: 'video',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              title: 'AI in Everyday Life',
              description: 'See how AI is already integrated into our daily routines'
            },
            {
              type: 'heading',
              text: 'Test Your Understanding',
              level: 2
            },
            {
              type: 'mcq',
              question: 'Which of the following is NOT a primary goal of Artificial Intelligence?',
              options: [
                'To simulate human intelligence',
                'To replace all human workers',
                'To solve complex problems',
                'To automate repetitive tasks'
              ],
              answer: 1,
              explanation: 'While AI can automate many tasks, its primary goal is not to replace all human workers but to augment human capabilities and solve complex problems that are difficult for traditional programming approaches.'
            },
            {
              type: 'paragraph',
              text: 'Great work! You\'ve completed the introduction to AI. In the next lesson, we\'ll explore the different types of AI systems and their applications.'
            }
          ]
        };

        setLesson(mockLesson);
      } catch (err) {
        setError('Failed to load lesson');
        console.error('Error fetching lesson:', err);
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
        <InlineLoader text="Loading lesson..." />
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