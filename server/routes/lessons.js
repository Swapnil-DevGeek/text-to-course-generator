const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/lessons/course/:courseId/module/:moduleIndex/lesson/:lessonIndex - Get specific lesson
router.get('/course/:courseId/module/:moduleIndex/lesson/:lessonIndex', lessonController.getLesson);

// POST /api/lessons/:lessonId/generate - Generate lesson content with AI
router.post('/:lessonId/generate', lessonController.generateLessonContent);

// PUT /api/lessons/:lessonId - Update lesson
router.put('/:lessonId', lessonController.updateLesson);

// GET /api/lessons/module/:moduleId - Get all lessons for a module
router.get('/module/:moduleId', lessonController.getModuleLessons);

module.exports = router;