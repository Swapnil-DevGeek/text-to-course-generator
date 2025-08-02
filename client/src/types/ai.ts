// AI Generation Types

export interface AIGeneratedLesson {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  estimatedDuration: string;
}

export interface AIGeneratedModule {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  lessons: AIGeneratedLesson[];
}

export interface AIGeneratedCourse {
  title: string;
  description: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  modules: AIGeneratedModule[];
}

// Content block types for lesson generation
export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'code' | 'video' | 'mcq';
  [key: string]: any;
}

export interface HeadingBlock extends ContentBlock {
  type: 'heading';
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ParagraphBlock extends ContentBlock {
  type: 'paragraph';
  text: string;
}

export interface CodeBlock extends ContentBlock {
  type: 'code';
  language: string;
  text: string;
}

export interface VideoBlock extends ContentBlock {
  type: 'video';
  searchQuery: string;
  title?: string;
  description?: string;
}

export interface MCQBlock extends ContentBlock {
  type: 'mcq';
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export type LessonContentBlock = HeadingBlock | ParagraphBlock | CodeBlock | VideoBlock | MCQBlock;

export interface AIGeneratedLessonContent {
  title: string;
  objectives: string[];
  estimatedDuration: string;
  content: LessonContentBlock[];
}

// API Request/Response types
export interface CourseGenerationRequest {
  topic: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
}

export interface LessonGenerationRequest {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  courseContext?: string;
  moduleContext?: string;
}

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

// Generation status is handled in UI components

// Gemini API specific types
export interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
}

// Error types
export class AIGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

export class InvalidJSONError extends AIGenerationError {
  constructor(rawResponse: string) {
    super('AI returned invalid JSON format', 'INVALID_JSON', { rawResponse });
  }
}

export class APIError extends AIGenerationError {
  constructor(message: string, public statusCode?: number) {
    super(message, 'API_ERROR', { statusCode });
  }
}