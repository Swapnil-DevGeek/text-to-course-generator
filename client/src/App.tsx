import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout } from '@/components/layout/Layout';

// Pages
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Dashboard } from '@/pages/Dashboard';
import { Profile } from '@/pages/Profile';
import { AuthCallback } from '@/pages/AuthCallback';
import { Courses } from '@/pages/Courses';
import { CourseView } from '@/pages/CourseView';
import { LessonView } from '@/pages/LessonView';
import { CreateCourse } from '@/pages/CreateCourse';

// Toast provider
import { Toaster } from '@/components/ui/sonner';

import './App.css';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize authentication state on app start
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="text-to-learn-theme">
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            
            {/* Auth routes - redirect to dashboard if already authenticated */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Signup />
                </ProtectedRoute>
              } 
            />
            
            {/* OAuth callback route */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected routes with Layout */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Layout>
                    <Courses />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/courses/:courseId" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Layout>
                    <CourseView />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Lesson view without sidebar for better focus */}
            <Route 
              path="/courses/:courseId/module/:moduleIndex/lesson/:lessonIndex" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <LessonView />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/create" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Layout>
                    <CreateCourse />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
