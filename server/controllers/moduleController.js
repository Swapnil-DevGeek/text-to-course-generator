const Module = require('../models/Module');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// Get module with lessons
exports.getModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.userId || req.user.id;

    const module = await Module.findById(moduleId)
      .populate('course')
      .populate('lessons');

    if (!module) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Module not found',
          code: 'MODULE_NOT_FOUND'
        }
      });
    }

    // Check if user owns the course
    if (module.course.creator !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        }
      });
    }

    res.json({
      success: true,
      data: module
    });

  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch module',
        code: 'FETCH_ERROR'
      }
    });
  }
};

// Update module
exports.updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.userId || req.user.id;
    const updates = req.body;

    const module = await Module.findById(moduleId).populate('course');

    if (!module) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Module not found',
          code: 'MODULE_NOT_FOUND'
        }
      });
    }

    // Check if user owns the course
    if (module.course.creator !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updates.course;
    delete updates.lessons;
    delete updates.generationMetadata;
    delete updates._id;

    Object.assign(module, updates);
    await module.save();

    res.json({
      success: true,
      data: module
    });

  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update module',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

// Get all modules for a course
exports.getCourseModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Verify course ownership
    const course = await Course.findOne({ _id: courseId, creator: userId });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found',
          code: 'COURSE_NOT_FOUND'
        }
      });
    }

    const modules = await Module.find({ course: courseId })
      .populate('lessons')
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: {
        course: course,
        modules: modules
      }
    });

  } catch (error) {
    console.error('Get course modules error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch modules',
        code: 'FETCH_ERROR'
      }
    });
  }
};