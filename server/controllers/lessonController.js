const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Course = require('../models/Course');
const aiService = require('../services/aiService');

// Generate lesson content with AI
exports.generateLessonContent = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Find the lesson and ensure user owns it
    const lesson = await Lesson.findById(lessonId).populate({
      path: 'module',
      populate: {
        path: 'course'
      }
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Lesson not found',
          code: 'LESSON_NOT_FOUND'
        }
      });
    }

    if (lesson.module.course.creator !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Generate lesson content with AI
    const aiResult = await aiService.generateLesson(
      lesson.module.course.title,
      lesson.module.title,
      lesson.title
    );

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate lesson content',
          code: 'AI_GENERATION_FAILED',
          details: aiResult.error
        }
      });
    }

    const lessonData = aiResult.data;

    // Update lesson with generated content
    lesson.content = lessonData.content;
    lesson.objectives = lessonData.objectives;
    lesson.estimatedDuration = lessonData.estimatedDuration;
    lesson.isEnriched = true;
    lesson.enrichmentLevel = 'comprehensive';
    lesson.generationMetadata = lessonData.generationMetadata;

    await lesson.save();

    res.json({
      success: true,
      data: lesson
    });

  } catch (error) {
    console.error('Lesson content generation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during lesson generation',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

// Get lesson with full content
exports.getLesson = async (req, res) => {
  try {
    const { courseId, moduleIndex, lessonIndex } = req.params;
    const userId = req.user.userId || req.user.id;

    // Find the course and ensure user owns it
    const course = await Course.findOne({ 
      _id: courseId, 
      creator: userId 
    }).populate({
      path: 'modules',
      populate: {
        path: 'lessons'
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found',
          code: 'COURSE_NOT_FOUND'
        }
      });
    }

    const moduleIdx = parseInt(moduleIndex);
    const lessonIdx = parseInt(lessonIndex);

    if (moduleIdx >= course.modules.length || lessonIdx >= course.modules[moduleIdx].lessons.length) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Lesson not found',
          code: 'LESSON_NOT_FOUND'
        }
      });
    }

    const module = course.modules[moduleIdx];
    const lesson = module.lessons[lessonIdx];

    // If lesson content is not enriched, generate it
    if (!lesson.isEnriched) {
      const aiResult = await aiService.generateLesson(
        course.title,
        module.title,
        lesson.title
      );

      if (aiResult.success) {
        const lessonData = aiResult.data;
        lesson.content = lessonData.content;
        lesson.objectives = lessonData.objectives;
        lesson.estimatedDuration = lessonData.estimatedDuration;
        lesson.isEnriched = true;
        lesson.enrichmentLevel = 'comprehensive';
        lesson.generationMetadata = lessonData.generationMetadata;
        await lesson.save();
      }
    }

    // Prepare lesson data with context
    const lessonData = {
      ...lesson.toJSON(),
      courseId: course._id,
      courseName: course.title,
      moduleIndex: moduleIdx,
      lessonIndex: lessonIdx,
      moduleTitle: module.title,
      totalModules: course.modules.length,
      totalLessonsInModule: module.lessons.length
    };

    res.json({
      success: true,
      data: lessonData
    });

  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch lesson',
        code: 'FETCH_ERROR'
      }
    });
  }
};

// Update lesson content
exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.userId || req.user.id;
    const updates = req.body;

    // Find the lesson and ensure user owns it
    const lesson = await Lesson.findById(lessonId).populate({
      path: 'module',
      populate: {
        path: 'course'
      }
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Lesson not found',
          code: 'LESSON_NOT_FOUND'
        }
      });
    }

    if (lesson.module.course.creator !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updates.module;
    delete updates.generationMetadata;
    delete updates._id;

    // Update lesson
    Object.assign(lesson, updates);
    await lesson.save();

    res.json({
      success: true,
      data: lesson
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update lesson',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

// Get lessons for a module
exports.getModuleLessons = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Find the module and ensure user owns it
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
      data: {
        module: module,
        lessons: module.lessons
      }
    });

  } catch (error) {
    console.error('Get module lessons error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch lessons',
        code: 'FETCH_ERROR'
      }
    });
  }
};