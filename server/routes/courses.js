const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');
const { validateCourseGeneration, validateCourseUpdate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// POST /api/courses/generate - Generate course with AI
router.post('/generate', validateCourseGeneration, courseController.generateCourse);

// GET /api/courses - Get all courses for authenticated user
router.get('/', courseController.getUserCourses);

// GET /api/courses/:courseId - Get specific course
router.get('/:courseId', courseController.getCourse);

// PUT /api/courses/:courseId - Update course
router.put('/:courseId', validateCourseUpdate, courseController.updateCourse);

// DELETE /api/courses/:courseId - Delete course
router.delete('/:courseId', courseController.deleteCourse);

module.exports = router;