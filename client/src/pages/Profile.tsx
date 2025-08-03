import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function Profile() {
  const { user, logout } = useAuthStore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account settings</p>
          </div>
          <Button 
            variant="outline" 
            onClick={logout}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Profile Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Your personal details</CardDescription>
                  </div>
                  
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Name</Label>
                        <p className="text-gray-900">{user?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Account Type</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">
                            {user?.authProvider === 'google' ? 'Google Account' : 'Email Account'}
                          </Badge>
                          {user?.emailVerified && (
                            <Badge className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
              </CardContent>
            </Card>

          </div>

          {/* Right - Account Summary */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Member since</span>
                    <span className="text-gray-900">
                      {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last login</span>
                    <span className="text-gray-900">
                      {user?.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}