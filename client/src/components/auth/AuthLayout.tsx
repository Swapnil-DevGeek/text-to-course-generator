import { type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  showLogo?: boolean;
}

export function AuthLayout({ children, title, description, showLogo = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {showLogo && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Text-to-Learn</h1>
            <p className="mt-2 text-sm text-gray-600">AI-Powered Course Generator</p>
          </div>
        )}
        
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
            <CardDescription className="text-center">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}