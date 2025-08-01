import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { InlineLoader } from '../components/ui/LoadingSpinner';
import { ErrorMessage, NotFoundError } from '../components/ui/ErrorMessage';
import { Progress } from '../components/ui/progress';

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  estimatedDuration?: string;
  difficulty?: string;
  progress?: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  estimatedDuration?: string;
  completed?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  estimatedDuration?: string;
  completed?: boolean;
}

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setError('Course ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock course data
        const mockCourse: Course = {
          id: courseId,
          title: 'Introduction to Artificial Intelligence',
          description: 'A comprehensive course covering the fundamentals of AI, machine learning, and their real-world applications.',
          estimatedDuration: '4 weeks',
          difficulty: 'Beginner',
          progress: 25,
          modules: [
            {
              id: '1',
              title: 'AI Fundamentals',
              description: 'Learn the basic concepts and history of artificial intelligence.',
              estimatedDuration: '1 week',
              completed: true,
              lessons: [
                {
                  id: '1',
                  title: 'What is Artificial Intelligence?',
                  description: 'Introduction to AI concepts and definitions.',
                  estimatedDuration: '30 min',
                  completed: true
                },
                {
                  id: '2',
                  title: 'History of AI',
                  description: 'Timeline and evolution of AI technology.',
                  estimatedDuration: '45 min',
                  completed: true
                },
                {
                  id: '3',
                  title: 'Types of AI Systems',
                  description: 'Understanding different categories of AI.',
                  estimatedDuration: '40 min',
                  completed: false
                }
              ]
            },
            {
              id: '2',
              title: 'Machine Learning Basics',
              description: 'Understanding the core concepts of machine learning.',
              estimatedDuration: '1.5 weeks',
              completed: false,
              lessons: [
                {
                  id: '1',
                  title: 'Introduction to Machine Learning',
                  description: 'What is ML and how does it relate to AI?',
                  estimatedDuration: '35 min',
                  completed: false
                },
                {
                  id: '2',
                  title: 'Supervised Learning',
                  description: 'Understanding supervised learning algorithms.',
                  estimatedDuration: '50 min',
                  completed: false
                }
              ]
            },
            {
              id: '3',
              title: 'Deep Learning',
              description: 'Advanced topics in neural networks and deep learning.',
              estimatedDuration: '1.5 weeks',
              completed: false,
              lessons: [
                {
                  id: '1',
                  title: 'Neural Networks',
                  description: 'Introduction to artificial neural networks.',
                  estimatedDuration: '60 min',
                  completed: false
                }
              ]
            }
          ]
        };

        setCourse(mockCourse);
      } catch (err) {
        setError('Failed to load course');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (!courseId) {
    return <Navigate to="/courses" replace />;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <InlineLoader text="Loading course..." />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <NotFoundError 
          resource="course"
          onGoBack={() => window.location.href = '/courses'}
        />
      </div>
    );
  }

  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (total, module) => total + module.lessons.filter(lesson => lesson.completed).length, 
    0
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {course.title}
            </h1>
            <p className="text-gray-600 max-w-3xl">
              {course.description}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {course.difficulty && (
              <Badge variant="outline">
                {course.difficulty}
              </Badge>
            )}
            {course.estimatedDuration && (
              <Badge variant="outline">
                {course.estimatedDuration}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Course Progress
            </span>
            <span className="text-sm text-gray-500">
              {completedLessons} of {totalLessons} lessons completed
            </span>
          </div>
          <Progress 
            value={(completedLessons / totalLessons) * 100} 
            className="w-full"
          />
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Course Modules</h2>
        
        {course.modules.map((module, moduleIndex) => (
          <Card key={module.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Module {moduleIndex + 1}: {module.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {module.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {module.completed && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  )}
                  {module.estimatedDuration && (
                    <Badge variant="outline">
                      {module.estimatedDuration}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          lesson.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {lesson.completed ? '✓' : lessonIndex + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {lesson.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {lesson.description}
                          </p>
                          {lesson.estimatedDuration && (
                            <span className="text-xs text-gray-500 mt-1 inline-block">
                              {lesson.estimatedDuration}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Link
                        to={`/courses/${courseId}/module/${moduleIndex}/lesson/${lessonIndex}`}
                      >
                        <Button
                          variant={lesson.completed ? "outline" : "default"}
                          size="sm"
                        >
                          {lesson.completed ? 'Review' : 'Start'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};