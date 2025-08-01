import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedDuration: string;
  progress: number;
  totalModules: number;
  totalLessons: number;
}

export const Courses: React.FC = () => {
  // Mock courses data
  const courses: Course[] = [
    {
      id: '1',
      title: 'Introduction to Artificial Intelligence',
      description: 'A comprehensive course covering the fundamentals of AI, machine learning, and their real-world applications.',
      difficulty: 'Beginner',
      estimatedDuration: '4 weeks',
      progress: 65,
      totalModules: 3,
      totalLessons: 12
    },
    {
      id: '2',
      title: 'Web Development with React',
      description: 'Learn modern web development with React, including hooks, context, and advanced patterns.',
      difficulty: 'Intermediate',
      estimatedDuration: '6 weeks',
      progress: 30,
      totalModules: 5,
      totalLessons: 18
    },
    {
      id: '3',
      title: 'Data Science Fundamentals',
      description: 'Master the basics of data science, including statistics, Python programming, and data visualization.',
      difficulty: 'Beginner',
      estimatedDuration: '8 weeks',
      progress: 0,
      totalModules: 6,
      totalLessons: 24
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-2">
              Continue your learning journey or explore new topics
            </p>
          </div>
          <Link to="/create">
            <Button>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
                <Badge variant="outline">
                  {course.estimatedDuration}
                </Badge>
              </div>
              <CardTitle className="text-xl leading-tight">
                {course.title}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {course.progress}%
                    </span>
                  </div>
                  <Progress value={course.progress} className="w-full h-2" />
                </div>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{course.totalModules} modules</span>
                  <span>{course.totalLessons} lessons</span>
                </div>

                {/* Action Button */}
                <Link to={`/courses/${course.id}`} className="block">
                  <Button className="w-full">
                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (if no courses) */}
      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first AI-generated course
          </p>
          <Link to="/create">
            <Button>
              Create Your First Course
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};