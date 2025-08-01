import React from 'react';
import { LessonRenderer } from '../components/LessonRenderer';

type ContentBlock = 
  | { type: 'heading'; text: string; level?: 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; language: string; text: string }
  | { type: 'video'; url: string; title?: string; description?: string }
  | { type: 'mcq'; question: string; options: string[]; answer: number; explanation?: string };

const sampleLessonContent: ContentBlock[] = [
  {
    type: 'heading',
    text: 'Introduction to Artificial Intelligence',
    level: 1
  },
  {
    type: 'paragraph',
    text: 'Artificial Intelligence (AI) is a rapidly evolving field that aims to create intelligent machines capable of performing tasks that normally require human intelligence. This includes learning, reasoning, problem-solving, perception, and language understanding.'
  },
  {
    type: 'heading',
    text: 'Key Concepts',
    level: 2
  },
  {
    type: 'paragraph',
    text: 'Before diving deeper into AI, let\'s understand some fundamental concepts that form the foundation of this field:'
  },
  {
    type: 'code',
    language: 'python',
    text: `# Simple AI example: Basic decision making
def make_decision(data):
    if data > 0.5:
        return "positive"
    else:
        return "negative"

# Example usage
result = make_decision(0.7)
print(f"Decision: {result}")`
  },
  {
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'AI Explained in Simple Terms',
    description: 'A comprehensive overview of artificial intelligence concepts'
  },
  {
    type: 'heading',
    text: 'Test Your Knowledge',
    level: 2
  },
  {
    type: 'mcq',
    question: 'What is the primary goal of Artificial Intelligence?',
    options: [
      'To replace all human workers',
      'To create machines that can perform tasks requiring human intelligence',
      'To make computers faster',
      'To improve internet connectivity'
    ],
    answer: 1,
    explanation: 'AI aims to create intelligent machines that can perform tasks typically requiring human intelligence, such as learning, reasoning, and problem-solving.'
  },
  {
    type: 'paragraph',
    text: 'Congratulations! You\'ve completed the introduction to AI. In the next lesson, we\'ll explore machine learning algorithms and their applications.'
  }
];

export const LessonDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lesson Renderer Demo
            </h1>
            <p className="text-gray-600">
              Demonstrating the modular lesson content rendering system
            </p>
          </div>
          
          <LessonRenderer content={sampleLessonContent} />
        </div>
      </div>
    </div>
  );
};