const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all user's course progress
router.get('/', progressController.getUserProgress);

// Get progress for a specific course
router.get('/course/:courseId', progressController.getCourseProgress);

// Get detailed progress for a course (with module/lesson breakdown)
router.get('/course/:courseId/detailed', progressController.getDetailedCourseProgress);

// Mark a lesson as completed
router.post('/course/:courseId/lesson/:lessonId/complete', progressController.completeLesson);

// Update current position in course
router.put('/course/:courseId/position', progressController.updateCurrentPosition);

module.exports = router;