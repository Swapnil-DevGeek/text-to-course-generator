import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { courseAPI } from '../services/api';

interface Course {
  id: string;
  _id?: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedDuration: string;
  progress?: number;
  updatedAt: string;
}

export function Dashboard() {
  const { user, logout } = useAuthStore();
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

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Text-to-Learn</h1>
              <p className="text-sm text-gray-600">AI-Powered Course Generator</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back!</CardTitle>
                <CardDescription>
                  Ready to create your next course?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/create">Generate New Course</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <strong>Name:</strong> {user?.name}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {user?.email}
                </p>
                <p className="text-sm">
                  <strong>Provider:</strong> {user?.authProvider === 'google' ? 'Google' : 'Email'}
                </p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Courses</CardTitle>
                <CardDescription>
                  Your recently generated courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
                ) : recentCourses.length > 0 ? (
                  <div className="space-y-3">
                    {recentCourses.map((course) => (
                      <Link
                        key={course._id || course.id}
                        to={`/courses/${course._id || course.id}`}
                        className="block"
                      >
                        <div className="p-2 rounded border hover:bg-gray-50 transition-colors">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {course.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {course.difficulty} • {course.estimatedDuration}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <Button asChild variant="outline" size="sm" className="w-full mt-2">
                      <Link to="/courses">View All Courses</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">
                      No courses yet. Create your first course!
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/create">Get Started</Link>
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