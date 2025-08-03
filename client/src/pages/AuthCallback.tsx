import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setTokens, setError } = useAuthStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current || isProcessing) {
      return;
    }

    const handleCallback = async () => {
      hasProcessed.current = true;
      setIsProcessing(true);

      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refresh');
      const error = searchParams.get('error');

      if (error) {
        let errorMessage = 'Authentication failed';
        
        switch (error) {
          case 'oauth_error':
            errorMessage = 'Google OAuth error occurred';
            break;
          case 'oauth_failed':
            errorMessage = 'Google OAuth authentication failed';
            break;
          default:
            errorMessage = 'Authentication error';
        }

        setError(errorMessage);
        toast({
          title: 'Authentication Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      if (token && refreshToken) {
        try {
          // Set tokens
          setTokens({
            accessToken: token,
            refreshToken: refreshToken,
          });

          // Fetch user profile
          const { authApi } = await import('@/services/auth');
          const response = await authApi.getProfile();
          
          if (response.success && response.data) {
            setUser(response.data.user);
            toast({
              title: 'Login successful',
              description: 'Welcome to Course Craft!',
            });
            navigate('/dashboard');
          } else {
            throw new Error('Failed to get user profile');
          }
        } catch (error: any) {
          console.error('Auth callback error:', error);
          setError('Failed to complete authentication');
          toast({
            title: 'Authentication Failed',
            description: 'Failed to complete Google authentication',
            variant: 'destructive',
          });
          navigate('/login');
        }
      } else {
        setError('Invalid authentication response');
        navigate('/login');
      }
    };

    handleCallback();
  }, []); // Empty dependency array to run only once

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">
          Completing authentication...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we sign you in.
        </p>
      </div>
    </div>
  );
}