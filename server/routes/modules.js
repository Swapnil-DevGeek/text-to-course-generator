const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/modules/:moduleId - Get specific module
router.get('/:moduleId', moduleController.getModule);

// PUT /api/modules/:moduleId - Update module
router.put('/:moduleId', moduleController.updateModule);

// GET /api/modules/course/:courseId - Get all modules for a course
router.get('/course/:courseId', moduleController.getCourseModules);

module.exports = router;