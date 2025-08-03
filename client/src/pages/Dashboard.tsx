import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { courseAPI } from '../services/api';

interface Course {
  id: string;
  _id?: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedDuration: string;
  updatedAt: string;
}

export function Dashboard() {
  const { user } = useAuthStore();
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentCourses = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getCourses({ limit: 3 });
        if (response.success && response.data?.courses) {
          setRecentCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Error fetching recent courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCourses();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-gray-600 mt-1">Continue your learning journey</p>
            </div>
            <Button asChild>
              <Link to="/create">Create Course</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left - Main Content */}
          <div className="lg:col-span-3">
            {/* Recent Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Courses</CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/courses">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {/* Skeleton loading animation */}
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="p-4 border rounded-lg animate-pulse">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                          <div className="ml-3">
                            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentCourses.length > 0 ? (
                  <div className="space-y-4">
                    {recentCourses.map((course) => (
                      <Link
                        key={course._id || course.id}
                        to={`/courses/${course._id || course.id}`}
                        className="block"
                      >
                        <div className="p-4 border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">
                                {course.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {course.description}
                              </p>
                              <span className="text-xs text-gray-500">
                                {course.estimatedDuration}
                              </span>
                            </div>
                            <Badge className={`ml-3 ${getDifficultyColor(course.difficulty)}`}>
                              {course.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-500 mb-4">Create your first course to get started</p>
                    <Button asChild>
                      <Link to="/create">Create Course</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}