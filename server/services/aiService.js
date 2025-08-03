const fetch = require('node-fetch');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.maxRetries = 3;
    this.retryDelay = 1000;

    if (!this.apiKey) {
      console.error('GEMINI_API_KEY environment variable is required');
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeGeminiRequest(prompt, temperature = 0.3) {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const request = {
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
          console.error(`Gemini API error (${response.status}):`, errorData);
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('No response generated from AI');
        }

        const generatedText = data.candidates[0].content.parts[0].text;
        return generatedText.trim();

      } catch (error) {
        console.error(`AI request attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        await this.delay(this.retryDelay * attempt);
      }
    }

    throw new Error('Max retries exceeded');
  }

  parseJSONResponse(response) {
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
      throw new Error('Invalid JSON format in AI response');
    }
  }

  generateCoursePrompt(topic, difficulty = 'Beginner', duration = '4-6 weeks') {
    return `You are an expert curriculum designer. Generate a comprehensive course outline for the topic: "${topic}".

REQUIREMENTS:
- Create a structured curriculum that progresses from foundational to advanced concepts
- Include 3-6 modules, each with 3-8 lessons
- Ensure comprehensive coverage of essential subtopics
- Make the content engaging and practical
- Target difficulty: ${difficulty}
- Estimated duration: ${duration}

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
      "title": "Module title",
      "description": "Module description (50-100 words)",
      "estimatedDuration": "X days",
      "objectives": ["Learning objective 1", "Learning objective 2"],
      "lessons": [
        {
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

  generateLessonPrompt(courseTitle, moduleTitle, lessonTitle) {
    return `You are an expert instructional designer. Create comprehensive, detailed lesson content for:

COURSE: ${courseTitle}
MODULE: ${moduleTitle}
LESSON: ${lessonTitle}

CONTENT REQUIREMENTS:
Create a DETAILED lesson with substantial content (15-25 content blocks minimum). Structure it as follows:

1. INTRODUCTION SECTION:
   - Clear learning objectives (3-5 objectives)
   - Overview paragraph explaining what will be covered
   - Relevant introductory video (ALWAYS include for main concepts)

2. MAIN CONTENT SECTIONS (3-5 sections):
   Each section should include:
   - Section heading (h2)
   - Detailed explanatory paragraphs (2-3 per section)
   - Specific educational videos for key concepts
   - Code examples when relevant to topic
   - Sub-headings (h3) for organization

3. PRACTICAL APPLICATION:
   - Hands-on examples or exercises
   - Relevant tutorial videos
   - Step-by-step explanations

4. ASSESSMENT:
   - 4-5 comprehensive MCQs testing understanding
   - Include explanations for correct answers

CONTENT BLOCK RULES:
- Paragraphs: Write substantial content (3-5 sentences minimum per paragraph)
- Videos: Include 2-3 video search queries per lesson for different concepts
- Code: Include practical, runnable examples when topic-relevant
- Headings: Use proper hierarchy (h1 for main title, h2 for sections, h3 for subsections)

VIDEO SEARCH QUERY RULES:
- Provide specific, educational search queries
- Include lesson topic keywords for relevance  
- Examples: "${lessonTitle} tutorial", "${courseTitle} ${lessonTitle} explained", "learn ${lessonTitle} step by step"
- Make them educational/tutorial focused

CODE RULES:
- Include working code examples when relevant to the lesson topic
- Use appropriate programming languages for the subject
- Provide complete, runnable examples with comments
- Include both basic and advanced examples when appropriate

OUTPUT FORMAT:
Return ONLY a JSON object with this exact structure (no markdown, no explanations):

{
  "title": "Lesson title",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "estimatedDuration": "X minutes",
  "content": [
    {
      "type": "heading",
      "content": "Heading text",
      "metadata": { "level": 1 },
      "order": 0
    },
    {
      "type": "paragraph",
      "content": "Paragraph content",
      "metadata": {},
      "order": 1
    },
    {
      "type": "code",
      "content": "code content",
      "metadata": { "language": "python" },
      "order": 2
    },
    {
      "type": "video",
      "content": { 
        "searchQuery": "specific educational search query related to lesson topic",
        "title": "Educational Video Title", 
        "description": "Brief description of what the video covers and why it's relevant" 
      },
      "metadata": {},
      "order": 3
    },
    {
      "type": "quiz",
      "content": {
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Explanation of why this is correct"
      },
      "metadata": {},
      "order": 4
    }
  ]
}

IMPORTANT REMINDERS:
- ALWAYS include 2-3 video blocks per lesson with relevant search queries
- Make content detailed and comprehensive (15-25 blocks minimum)
- Use specific, educational video search queries related to the lesson topic
- Include substantial paragraph content with detailed explanations

Generate the lesson content now:`;
  }

  async generateCourse(topic, difficulty, duration) {
    try {
      const startTime = Date.now();
      const prompt = this.generateCoursePrompt(topic, difficulty, duration);
      const response = await this.makeGeminiRequest(prompt, 0.4);
      const courseData = this.parseJSONResponse(response);
      const processingTime = Date.now() - startTime;

      // Add generation metadata
      const enrichedCourse = {
        ...courseData,
        originalPrompt: topic,
        generationMetadata: {
          model: 'gemini-1.5-flash',
          generatedAt: new Date(),
          processingTime
        }
      };

      return { success: true, data: enrichedCourse };
    } catch (error) {
      console.error('Course generation failed:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Course generation failed',
          code: 'GENERATION_ERROR'
        }
      };
    }
  }

  async generateLesson(courseTitle, moduleTitle, lessonTitle) {
    try {
      const startTime = Date.now();
      const prompt = this.generateLessonPrompt(courseTitle, moduleTitle, lessonTitle);
      const response = await this.makeGeminiRequest(prompt, 0.3);
      const lessonData = this.parseJSONResponse(response);
      const processingTime = Date.now() - startTime;

      // Add generation metadata
      const enrichedLesson = {
        ...lessonData,
        generationMetadata: {
          model: 'gemini-1.5-flash',
          generatedAt: new Date(),
          processingTime
        }
      };

      return { success: true, data: enrichedLesson };
    } catch (error) {
      console.error('Lesson generation failed:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Lesson generation failed',
          code: 'GENERATION_ERROR'
        }
      };
    }
  }


  async testConnection() {
    try {
      const testPrompt = 'Return only this JSON: {"test": "success", "status": "connected"}';
      const response = await this.makeGeminiRequest(testPrompt, 0.1);
      const parsed = this.parseJSONResponse(response);
      return parsed.test === 'success' && parsed.status === 'connected';
    } catch (error) {
      console.error('AI service test failed:', error);
      return false;
    }
  }
}

module.exports = new AIService();