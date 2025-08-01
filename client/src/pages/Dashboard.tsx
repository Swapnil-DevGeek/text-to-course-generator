import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Dashboard() {
  const { user, logout } = useAuthStore();

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
                <Button className="w-full">
                  Generate New Course
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
                <p className="text-sm text-gray-500 text-center py-4">
                  No courses yet. Create your first course!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}