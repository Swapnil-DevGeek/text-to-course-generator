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
import { AuthCallback } from '@/pages/AuthCallback';
import { LessonDemo } from '@/pages/LessonDemo';
import { Courses } from '@/pages/Courses';
import { CourseView } from '@/pages/CourseView';
import { LessonView } from '@/pages/LessonView';

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
            <Route path="/lesson-demo" element={<LessonDemo />} />
            
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
                    <div className="max-w-4xl mx-auto p-6">
                      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Course</h1>
                      <p className="text-gray-600">Course creation feature coming soon...</p>
                    </div>
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
