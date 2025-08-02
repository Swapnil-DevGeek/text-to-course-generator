import type {
  AIGeneratedCourse,
  AIGeneratedLessonContent,
  CourseGenerationRequest,
  LessonGenerationRequest,
  AIResponse,
  GeminiRequest,
  GeminiResponse,
  AIGenerationError,
  InvalidJSONError,
  APIError
} from '../types/ai';

class AIService {
  private apiKey: string;
  private baseUrl: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.maxRetries = 3;
    this.retryDelay = 1000;

    if (!this.apiKey) {
      console.warn('Gemini API key not found. AI features will not work.');
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeGeminiRequest(prompt: string, temperature = 0.3): Promise<string> {
    if (!this.apiKey) {
      throw new APIError('Gemini API key is not configured');
    }

    const request: GeminiRequest = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new APIError(`API request failed: ${response.status} ${response.statusText}`, response.status);
        }

        const data: GeminiResponse = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
          throw new APIError('No response generated from AI');
        }

        const generatedText = data.candidates[0].content.parts[0].text;
        return generatedText.trim();

      } catch (error) {
        console.error(`AI request attempt ${attempt} failed:`, error);
        
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        await this.delay(this.retryDelay * attempt);
      }
    }

    throw new APIError('Max retries exceeded');
  }

  private parseJSONResponse<T>(response: string): T {
    try {
      // Clean the response to ensure it's valid JSON
      let cleanedResponse = response.trim();
      
      // Remove any markdown code block formatting
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Find the JSON object in the response
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }

      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Failed to parse JSON response:', response);
      throw new InvalidJSONError(response);
    }
  }

  private generateCoursePrompt(request: CourseGenerationRequest): string {
    return `You are an expert curriculum designer. Generate a comprehensive course outline for the topic: "${request.topic}".

REQUIREMENTS:
- Create a structured curriculum that progresses from foundational to advanced concepts
- Include 3-6 modules, each with 3-8 lessons
- Ensure comprehensive coverage of essential subtopics
- Make the content engaging and practical
- Target difficulty: ${request.difficulty || 'Beginner'}
- Estimated duration: ${request.duration || '4-6 weeks'}

OUTPUT FORMAT:
Return ONLY a JSON object with this exact structure (no markdown, no explanations):

{
  "title": "Course title",
  "description": "Comprehensive course description (100-200 words)",
  "tags": ["tag1", "tag2", "tag3"],
  "difficulty": "Beginner|Intermediate|Advanced",
  "estimatedDuration": "X weeks",
  "modules": [
    {
      "id": "module-1",
      "title": "Module title",
      "description": "Module description (50-100 words)",
      "estimatedDuration": "X days",
      "lessons": [
        {
          "id": "lesson-1",
          "title": "Lesson title",
          "description": "Lesson description (30-50 words)",
          "objectives": ["Learning objective 1", "Learning objective 2"],
          "estimatedDuration": "X minutes"
        }
      ]
    }
  ]
}

Generate the course outline now:`;
  }

  private generateLessonPrompt(request: LessonGenerationRequest): string {
    return `You are an expert instructional designer. Create detailed lesson content for:

COURSE: ${request.courseTitle}
MODULE: ${request.moduleTitle}
LESSON: ${request.lessonTitle}

CONTENT REQUIREMENTS:
1. Start with clear learning objectives
2. Include various content block types:
   - Headings (h1-h6) for structure
   - Paragraphs for explanations
   - Code blocks (when relevant to topic)
   - Video search queries (not direct links)
   - Multiple choice questions (4-5 MCQs at the end)

3. MCQ Rules:
   - Include 4-5 questions that test understanding
   - Provide clear explanations for correct answers
   - Make options realistic and challenging

4. Video Rules:
   - Provide search queries, not direct URLs
   - Example: "machine learning basics tutorial" not "https://youtube.com/..."

5. Code Rules:
   - Include code blocks only when relevant to the lesson topic
   - Use appropriate programming languages
   - Include practical, runnable examples

OUTPUT FORMAT:
Return ONLY a JSON object with this exact structure (no markdown, no explanations):

{
  "title": "Lesson title",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "estimatedDuration": "X minutes",
  "content": [
    {
      "type": "heading",
      "text": "Heading text",
      "level": 1
    },
    {
      "type": "paragraph",
      "text": "Paragraph content"
    },
    {
      "type": "code",
      "language": "python",
      "text": "code content"
    },
    {
      "type": "video",
      "searchQuery": "search query for video",
      "title": "Video title",
      "description": "Video description"
    },
    {
      "type": "mcq",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Explanation of why this is correct"
    }
  ]
}

Generate the lesson content now:`;
  }

  async generateCourse(request: CourseGenerationRequest): Promise<AIResponse<AIGeneratedCourse>> {
    try {
      const prompt = this.generateCoursePrompt(request);
      const response = await this.makeGeminiRequest(prompt, 0.4);
      const courseData = this.parseJSONResponse<AIGeneratedCourse>(response);

      return {
        success: true,
        data: courseData
      };
    } catch (error) {
      console.error('Course generation failed:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: error instanceof AIGenerationError ? error.code : 'UNKNOWN_ERROR',
          details: error instanceof AIGenerationError ? error.details : undefined
        }
      };
    }
  }

  async generateLesson(request: LessonGenerationRequest): Promise<AIResponse<AIGeneratedLessonContent>> {
    try {
      const prompt = this.generateLessonPrompt(request);
      const response = await this.makeGeminiRequest(prompt, 0.3);
      const lessonData = this.parseJSONResponse<AIGeneratedLessonContent>(response);

      return {
        success: true,
        data: lessonData
      };
    } catch (error) {
      console.error('Lesson generation failed:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: error instanceof AIGenerationError ? error.code : 'UNKNOWN_ERROR',
          details: error instanceof AIGenerationError ? error.details : undefined
        }
      };
    }
  }

  // Test the AI service with a simple request
  async testConnection(): Promise<boolean> {
    try {
      const testPrompt = 'Return only this JSON: {"test": "success", "status": "connected"}';
      const response = await this.makeGeminiRequest(testPrompt, 0.1);
      const parsed = this.parseJSONResponse<{ test: string; status: string }>(response);
      return parsed.test === 'success' && parsed.status === 'connected';
    } catch (error) {
      console.error('AI service test failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();
export { AIService };