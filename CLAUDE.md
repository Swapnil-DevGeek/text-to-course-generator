# Text-to-Learn: AI-Powered Course Generator

## 📋 Project Overview

**Text-to-Learn** is a full-stack web application that transforms user-submitted topics into structured, multi-module online courses using AI-powered content generation. This hackathon project demonstrates end-to-end development skills with modern web technologies and AI integration.

### Project Objectives
- Build a complete full-stack application with AI integration
- Design and implement a prompt-ingestion API
- Create responsive, professional UI with rich UX
- Implement persistent data storage
- Deploy with CI/CD pipeline

### Core Functionality
1. **Input**: Accept free-form text prompts describing learning topics
2. **Process**: Generate comprehensive course content using AI
3. **Output**: Render navigable course syllabus with persistent storage

## 🎯 MVP Requirements

### Essential Features
- [ ] Course generation from text prompts
- [ ] Structured course output (3-6 modules, 3-5 lessons each)
- [ ] Course persistence in database
- [ ] Clean, responsive UI
- [ ] Course navigation and viewing

### Generated Content Structure
Each course must include:
- **Course**: Title, description, overview
- **Modules**: 3-6 modules per course
- **Lessons**: 3-5 lessons per module
- **Lesson Content**: Clear objectives, key topics, suggested readings/links

### Example Prompts
- "Intro to React Hooks"
- "Basics of Copyright Law"
- "Machine Learning Fundamentals"
- "Digital Marketing Strategy"

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.0
- **Styling**: Tailwind CSS 4.1
- **State Management**: React Context/useState (consider Zustand for complex state)
- **HTTP Client**: Fetch API or Axios
- **Routing**: React Router (to be added)

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express 5.1
- **Database**: MongoDB with Mongoose 8.17
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Environment**: dotenv for configuration
- **Development**: Nodemon for auto-restart

### AI Integration
- **Primary**: OpenAI API (GPT-4 or GPT-3.5-turbo)
- **Alternative**: Hugging Face Inference API
- **Fallback**: Rule-based template engine

### Current Project Structure
```
text-to-course/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API calls and external services
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # Global styles and Tailwind config
│   └── public/
├── server/                 # Express backend
│   ├── controllers/       # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic and AI integration
│   └── utils/            # Helper functions
└── CLAUDE.md             # This file
```

## 🗄️ Database Schema

### Course Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  prompt: String (required), // Original user prompt
  modules: [ModuleId],
  createdAt: Date,
  updatedAt: Date,
  estimatedDuration: String, // e.g., "4 weeks"
  difficulty: String, // beginner, intermediate, advanced
  tags: [String]
}
```

### Module Model
```javascript
{
  _id: ObjectId,
  courseId: ObjectId (required),
  title: String (required),
  description: String (required),
  order: Number (required),
  lessons: [LessonId],
  estimatedDuration: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Lesson Model
```javascript
{
  _id: ObjectId,
  moduleId: ObjectId (required),
  title: String (required),
  objectives: [String],
  keyTopics: [String],
  content: String, // Main lesson content
  resources: [{
    title: String,
    url: String,
    type: String // article, video, book, etc.
  }],
  order: Number (required),
  estimatedDuration: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Specifications

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Endpoints

#### Course Generation
```http
POST /api/courses/generate
Content-Type: application/json

{
  "prompt": "Intro to React Hooks"
}

Response:
{
  "success": true,
  "data": {
    "courseId": "course_id",
    "title": "Complete Guide to React Hooks",
    "description": "Learn React Hooks from basics to advanced patterns",
    "modules": [...],
    "estimatedDuration": "3 weeks"
  }
}
```

#### Get Course
```http
GET /api/courses/:id

Response:
{
  "success": true,
  "data": {
    "course": {...},
    "modules": [...],
    "lessons": [...]
  }
}
```

#### List Courses
```http
GET /api/courses?page=1&limit=10

Response:
{
  "success": true,
  "data": {
    "courses": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Error Handling
All API responses include:
```javascript
{
  "success": boolean,
  "data": any, // On success
  "error": {   // On failure
    "message": string,
    "code": string,
    "details": any
  }
}
```

## 🎨 Design System & UI Guidelines

### Design Principles
- **Professional**: Clean, modern, business-appropriate
- **Minimal**: Focus on content, reduce visual clutter
- **Rich UX**: Smooth interactions, thoughtful micro-animations
- **Responsive**: Mobile-first, works on all devices

### Color Palette
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

### Typography
- **Headings**: Inter, system-ui, sans-serif
- **Body**: Inter, system-ui, sans-serif
- **Code**: 'Fira Code', 'JetBrains Mono', monospace

### Component Patterns

#### Course Card
- Clean card design with subtle shadows
- Clear hierarchy: title → description → metadata
- Hover states with smooth transitions
- Progress indicators where applicable

#### Navigation
- Sticky header with logo and main navigation
- Breadcrumb navigation for course sections
- Side navigation for course content

#### Forms
- Clean input designs with proper focus states
- Clear validation messages
- Loading states during submission
- Success/error feedback

### Spacing & Layout
- **Container**: max-width: 1200px, centered
- **Grid**: CSS Grid and Flexbox for layouts
- **Spacing**: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64px)

### Animations & Interactions
- **Page Transitions**: Smooth fade-in/out
- **Loading States**: Skeleton screens and spinners
- **Hover Effects**: Subtle scale/shadow changes
- **Form Interactions**: Focus states, validation feedback

## 📁 Component Structure

### Shared Components
```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── LoadingSpinner.tsx
│   └── Badge.tsx
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx
│   └── Container.tsx
└── course/
    ├── CourseCard.tsx
    ├── ModuleList.tsx
    ├── LessonContent.tsx
    └── CourseProgress.tsx
```

### Page Components
```
pages/
├── Home.tsx              # Landing page with course generation
├── CourseView.tsx        # Individual course display
├── CourseListing.tsx     # List of generated courses
└── NotFound.tsx          # 404 page
```

## 🔧 Development Commands

### Frontend (client/)
```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint

# Preview production build
pnpm preview
```

### Backend (server/)
```bash
# Install dependencies
pnpm install

# Development server (with nodemon)
pnpm start

# Production server
node app.js
```

### Environment Variables
Create `.env` files in both client and server directories:

#### Server .env
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/text-to-course
JWT_SECRET=your-jwt-secret-key
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
```

#### Client .env
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Text-to-Learn
```

## 🚀 Deployment Strategy

### Recommended Platforms
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas

### CI/CD Pipeline
1. **GitHub Actions** for automated testing and deployment
2. **Feature branches** for development
3. **Pull requests** for code review
4. **Automatic deployment** on main branch push

### Build Process
1. Frontend builds to static files
2. Backend bundles with dependencies
3. Database migrations (if needed)
4. Environment variable configuration

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Storybook (optional)
- **E2E Tests**: Playwright or Cypress (future)

### Backend Testing
- **Unit Tests**: Jest
- **Integration Tests**: Supertest
- **API Tests**: Postman collections

## 🔒 Security Considerations

### API Security
- Rate limiting on course generation
- Input validation and sanitization
- JWT token expiration
- CORS configuration

### Data Protection
- Environment variable security
- API key protection
- Database connection security

## 📈 Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Bundle analysis with Vite
- Lazy loading for course content

### Backend
- Database indexing
- API response caching
- Compression middleware
- Connection pooling

## 🎯 Success Metrics

### Functionality
- ✅ Successful course generation from prompts
- ✅ Proper course structure (modules, lessons)
- ✅ Data persistence
- ✅ Responsive UI

### Code Quality
- ✅ Clean, modular architecture
- ✅ TypeScript type safety
- ✅ Consistent code style
- ✅ Proper error handling

### Design/UX
- ✅ Professional, minimal design
- ✅ Smooth interactions
- ✅ Mobile responsiveness
- ✅ Fast loading times

### Innovation
- ✅ AI integration quality
- ✅ Unique features (PDF export, templates)
- ✅ User experience enhancements

## 🔄 Development Workflow

### Feature Development
1. Create feature branch from main
2. Implement feature with tests
3. Update documentation
4. Create pull request
5. Code review and merge

### Git Strategy
- **main**: Production-ready code
- **develop**: Integration branch (optional)
- **feature/***: Feature development
- **hotfix/***: Critical fixes

### Code Standards
- **Prettier** for code formatting
- **ESLint** for code quality
- **Conventional Commits** for commit messages
- **TypeScript** strict mode enabled

## 📝 Documentation Requirements

### Code Documentation
- JSDoc comments for complex functions
- README updates for new features
- API documentation updates
- Component prop documentation

### User Documentation
- Feature usage guides
- API endpoint documentation
- Deployment instructions
- Troubleshooting guide

---

## 🎯 Next Steps for Development

1. **Set up project structure** - Create folders and basic components
2. **Design system** - Implement UI components with Tailwind
3. **Database setup** - Create MongoDB models and connection
4. **API development** - Build course generation endpoints
5. **AI integration** - Connect OpenAI API for content generation
6. **Frontend integration** - Connect UI to backend APIs
7. **Testing** - Add tests for critical functionality
8. **Deployment** - Set up CI/CD and deploy to production

This document serves as the single source of truth for the Text-to-Learn project. Update it as the project evolves and new requirements emerge.