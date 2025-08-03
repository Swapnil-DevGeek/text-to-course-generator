import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

// Specialized layout for course/lesson pages
export const CourseLayout: React.FC<{
  courseName?: string;
  moduleIndex?: number;
  lessonIndex?: number;
  totalModules?: number;
  totalLessons?: number;
  children?: React.ReactNode;
}> = ({ 
  courseName, 
  moduleIndex, 
  lessonIndex,
  totalModules,
  totalLessons,
  children 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Course-specific Topbar */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {courseName || 'Course'}
                </h1>
                {(moduleIndex !== undefined || lessonIndex !== undefined) && (
                  <div className="flex items-center space-x-2 mt-1">
                    {moduleIndex !== undefined && (
                      <span className="text-sm text-gray-600">
                        Module {moduleIndex + 1}
                        {totalModules && ` of ${totalModules}`}
                      </span>
                    )}
                    {moduleIndex !== undefined && lessonIndex !== undefined && (
                      <span className="text-gray-400">•</span>
                    )}
                    {lessonIndex !== undefined && (
                      <span className="text-sm text-gray-600">
                        Lesson {lessonIndex + 1}
                        {totalLessons && ` of ${totalLessons}`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};