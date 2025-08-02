import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { InlineLoader } from '../components/ui/LoadingSpinner';
import { NotFoundError } from '../components/ui/ErrorMessage';
import { Progress } from '../components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { courseAPI, progressAPI } from '../services/api';

interface Course {
  _id: string;
  title: string;
  description: string;
  modules: Module[];
  estimatedDuration?: string;
  difficulty?: string;
  progress?: number;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  estimatedDuration?: string;
  completed?: boolean;
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  estimatedDuration?: string;
  completed?: boolean;
}

interface DetailedProgress {
  courseId: string;
  courseName: string;
  overallProgress: number;
  currentModule: number;
  currentLesson: number;
  courseCompleted: boolean;
  totalModules: number;
  modules: ModuleProgress[];
}

interface ModuleProgress {
  moduleId: string;
  moduleIndex: number;
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  isCompleted: boolean;
  progressPercentage: number;
  lessons: LessonProgress[];
}

interface LessonProgress {
  lessonId: string;
  lessonIndex: number;
  title: string;
  isCompleted: boolean;
}

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<DetailedProgress | null>(null);
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
        
        const [courseResponse, progressResponse] = await Promise.all([
          courseAPI.getCourse(courseId),
          progressAPI.getDetailedCourseProgress(courseId)
        ]);
        
        if (courseResponse.success && courseResponse.data) {
          setCourse(courseResponse.data);
        } else {
          setError('Failed to load course');
        }

        if (progressResponse.success && progressResponse.data) {
          setProgress(progressResponse.data);
        }
      } catch (err: any) {
        console.error('Error fetching course:', err);
        const errorMessage = err?.response?.data?.error?.message || 
                            err?.message || 
                            'Failed to load course';
        setError(errorMessage);
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

  const totalLessons = progress ? progress.modules.reduce((total, module) => total + module.totalLessons, 0) : 0;
  const completedLessons = progress ? progress.modules.reduce((total, module) => total + module.completedLessons, 0) : 0;
  const overallProgress = progress ? progress.overallProgress : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 pb-12">
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
            value={overallProgress} 
            className="w-full"
          />
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Course Modules</h2>

        <Accordion type="multiple" className="w-full space-y-4">
          {course.modules.map((module, moduleIndex) => {
            const moduleProgress = progress?.modules[moduleIndex];
            return (
              <AccordionItem key={module._id} value={`module-${moduleIndex}`} className="border rounded-lg overflow-hidden !border-b">
                <AccordionTrigger className="px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between w-full pr-4">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Module {moduleIndex + 1}: {module.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {module.description}
                      </p>
                      {moduleProgress && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{moduleProgress.completedLessons} of {moduleProgress.totalLessons} lessons</span>
                          </div>
                          <Progress value={moduleProgress.progressPercentage} className="w-full h-2" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {moduleProgress?.isCompleted && (
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
                </AccordionTrigger>
                
                <AccordionContent className="px-0 pb-0">
                  <div className="divide-y divide-gray-200">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const lessonProgress = moduleProgress?.lessons[lessonIndex];
                      const isCompleted = lessonProgress?.isCompleted || false;
                      return (
                        <div key={lesson._id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {isCompleted ? '✓' : lessonIndex + 1}
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
                                variant={isCompleted ? "outline" : "default"}
                                size="sm"
                              >
                                {isCompleted ? 'Review' : 'Start'}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

      </div>

      {/* Continue Learning or Resume */}
      {progress && progress.overallProgress > 0 && progress.overallProgress < 100 && (
        <div className="m-8 text-center">
          <Link
            to={`/courses/${courseId}/module/${progress.currentModule}/lesson/${progress.currentLesson}`}
          >
            <Button size="lg">
              Continue Learning
              <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      )}

      {/* Course Completed */}
      {progress?.courseCompleted && (
        <div className="mt-8 mb-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-green-900 mb-2">Course Completed!</h3>
            <p className="text-green-700">
              Congratulations! You've successfully completed this course.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};