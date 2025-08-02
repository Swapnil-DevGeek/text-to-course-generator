import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { CourseGenerationStatus, GenerationSuccess } from '../components/ui/GenerationStatus';
import { courseAPI } from '../services/api';
// Temporary inline types to avoid import issues
interface AIGeneratedCourse {
  title: string;
  description: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    estimatedDuration: string;
    lessons: Array<{
      id: string;
      title: string;
      description: string;
      objectives: string[];
      estimatedDuration: string;
    }>;
  }>;
}

interface CourseGenerationRequest {
  topic: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
}

export const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [duration, setDuration] = useState('4-6 weeks');
  const [customRequirements, setCustomRequirements] = useState('');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedCourse, setGeneratedCourse] = useState<AIGeneratedCourse | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validation
  const isFormValid = topic.trim().length >= 3;

  const handleGenerate = async () => {
    if (!isFormValid) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedCourse(null);
    setShowSuccess(false);

    try {
      const request: CourseGenerationRequest = {
        topic: topic.trim(),
        difficulty,
        duration
      };

      const response = await courseAPI.generateCourse(request);

      if (response.success && response.data) {
        setGeneratedCourse(response.data);
        setShowSuccess(true);
      } else {
        setGenerationError(response.error?.message || 'Failed to generate course');
      }
    } catch (error: any) {
      console.error('Course generation error:', error);
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'An unexpected error occurred while generating the course';
      setGenerationError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setGenerationError(null);
    handleGenerate();
  };

  const handleCancel = () => {
    setIsGenerating(false);
    setGenerationError(null);
  };

  const handleViewCourse = () => {
    if (generatedCourse) {
      // Navigate to the actual generated course
      navigate(`/courses/${generatedCourse._id}`);
    }
  };

  const handleCreateAnother = () => {
    setTopic('');
    setCustomRequirements('');
    setGeneratedCourse(null);
    setShowSuccess(false);
    setGenerationError(null);
  };

  const exampleTopics = [
    'Introduction to Machine Learning',
    'Web Development with React',
    'Digital Marketing Fundamentals',
    'Data Science with Python',
    'UI/UX Design Principles',
    'Cybersecurity Basics',
    'Project Management',
    'Photography for Beginners'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create AI-Generated Course
        </h1>
        <p className="text-gray-600">
          Transform any topic into a structured, comprehensive online course using AI
        </p>
      </div>

      {/* Generation Status */}
      {(isGenerating || generationError) && (
        <div className="mb-8">
          <CourseGenerationStatus
            isGenerating={isGenerating}
            error={generationError || undefined}
            onRetry={handleRetry}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Success Status */}
      {showSuccess && generatedCourse && (
        <div className="mb-8">
          <GenerationSuccess
            type="course"
            title={generatedCourse.title}
            onViewResult={handleViewCourse}
            onCreateAnother={handleCreateAnother}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Creation Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                Provide a topic and we'll create a comprehensive course curriculum for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic Input */}
              <div>
                <Label htmlFor="topic">Course Topic *</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Introduction to Machine Learning"
                  className="mt-1"
                  disabled={isGenerating}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be specific about what you want to teach
                </p>
              </div>

              {/* Example Topics */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Popular Topics
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {exampleTopics.map((example) => (
                    <Badge
                      key={example}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => !isGenerating && setTopic(example)}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Course Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => setDifficulty(value)}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Course Duration</Label>
                  <Select
                    value={duration}
                    onValueChange={setDuration}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="3-4 weeks">3-4 weeks</SelectItem>
                      <SelectItem value="4-6 weeks">4-6 weeks</SelectItem>
                      <SelectItem value="6-8 weeks">6-8 weeks</SelectItem>
                      <SelectItem value="8+ weeks">8+ weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Requirements */}
              <div>
                <Label htmlFor="requirements">Additional Requirements (Optional)</Label>
                <Textarea
                  id="requirements"
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  placeholder="Any specific topics, tools, or approaches you want included..."
                  className="mt-1"
                  rows={3}
                  disabled={isGenerating}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!isFormValid || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Course...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Course with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Course Preview/Info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>What You'll Get</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Structured Curriculum</h4>
                    <p className="text-sm text-gray-600">
                      3-6 modules with comprehensive lesson breakdowns
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Learning Objectives</h4>
                    <p className="text-sm text-gray-600">
                      Clear goals for each lesson and module
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Time Estimates</h4>
                    <p className="text-sm text-gray-600">
                      Duration estimates for planning your schedule
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Smart Tags</h4>
                    <p className="text-sm text-gray-600">
                      Automatically categorized for easy discovery
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Course Preview */}
          {generatedCourse && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Generated Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{generatedCourse.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {generatedCourse.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {generatedCourse.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Modules:</span>
                      <span>{generatedCourse.modules.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lessons:</span>
                      <span>
                        {generatedCourse.modules.reduce((total, module) => total + module.lessons.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{generatedCourse.estimatedDuration}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};