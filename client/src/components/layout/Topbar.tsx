import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showBreadcrumbs?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  showBreadcrumbs = true
}) => {
  const location = useLocation();

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);  
    const breadcrumbs: { name: string; href: string; current: boolean }[] = [];

    // Add Dashboard as root
    breadcrumbs.push({
      name: 'Dashboard',
      href: '/dashboard',
      current: pathSegments.length === 1 && pathSegments[0] === 'dashboard'
    });

    // Generate breadcrumbs based on path
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      let name = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Custom names for specific routes
      switch (segment) {
        case 'courses':
          name = 'My Courses';
          break;
        case 'create':
          name = 'Create Course';
          break;
        case 'lesson-demo':
          name = 'Lesson Demo';
          break;
        case 'module':
          name = `Module ${pathSegments[index + 1] || ''}`;
          break;
        case 'lesson':
          name = `Lesson ${pathSegments[index + 1] || ''}`;
          break;
        default:
          // Keep the default name
          break;
      }
      const isId = /^\d+$/.test(segment) || /^[0-9a-fA-F]{24}$/.test(segment);
      
      if (!isId) {
        breadcrumbs.push({
          name,
          href: currentPath,
          current: isLast
        });
      } else if (index > 0 && pathSegments[index - 1] === 'courses') {
        breadcrumbs.push({
          name: 'Course Details',
          href: currentPath,
          current: isLast
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();


  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        {showBreadcrumbs && breadcrumbs.length > 1 && (
          <Breadcrumb className="mb-3">
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.href}>
                  <BreadcrumbItem>
                    {breadcrumb.current ? (
                      <BreadcrumbPage className="text-gray-900 font-medium">
                        {breadcrumb.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link 
                          to={breadcrumb.href}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {breadcrumb.name}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
    </div>
  );
};


export const CourseTopbar: React.FC<{
  courseName?: string;
  moduleIndex?: number;
  lessonIndex?: number;
  totalModules?: number;
  totalLessons?: number;
}> = ({ 
  courseName = 'Course', 
  moduleIndex, 
  lessonIndex,
  totalModules,
  totalLessons 
}) => {
  let title = courseName;
  let subtitle = '';

  if (moduleIndex !== undefined && lessonIndex !== undefined) {
    title = `${courseName} - Lesson ${lessonIndex + 1}`;
    subtitle = `Module ${moduleIndex + 1}${totalModules ? ` of ${totalModules}` : ''}`;
  } else if (moduleIndex !== undefined) {
    title = `${courseName} - Module ${moduleIndex + 1}`;
    subtitle = totalModules ? `Module ${moduleIndex + 1} of ${totalModules}` : '';
  }

  const actions = (
    <div className="flex items-center space-x-2">
      {moduleIndex !== undefined && totalModules && (
        <Badge variant="outline">
          Module {moduleIndex + 1}/{totalModules}
        </Badge>
      )}
      {lessonIndex !== undefined && totalLessons && (
        <Badge variant="outline">
          Lesson {lessonIndex + 1}/{totalLessons}
        </Badge>
      )}
    </div>
  );

  return (
    <Topbar
      title={title}
      subtitle={subtitle}
      actions={actions}
    />
  );
};