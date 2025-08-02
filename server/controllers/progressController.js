const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

// Get progress for a specific course
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Verify user owns the course
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

    const progress = await Progress.getOrCreateProgress(userId, courseId);
    await progress.calculateProgress();

    res.json({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch course progress',
        code: 'FETCH_ERROR'
      }
    });
  }
};

// Mark a lesson as completed
exports.completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { timeSpent = 0 } = req.body;
    const userId = req.user.userId || req.user.id;

    // Verify user owns the course
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

    // Verify lesson exists and belongs to this course
    const lesson = await Lesson.findById(lessonId).populate({
      path: 'module',
      populate: {
        path: 'course'
      }
    });

    if (!lesson || lesson.module.course._id.toString() !== courseId) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Lesson not found',
          code: 'LESSON_NOT_FOUND'
        }
      });
    }

    const progress = await Progress.getOrCreateProgress(userId, courseId);
    await progress.completeLesson(lessonId, timeSpent);
    await progress.calculateProgress();

    // Check if module is now completed
    const moduleProgress = await checkModuleCompletion(progress, lesson.module._id);

    res.json({
      success: true,
      data: {
        progress,
        moduleCompleted: moduleProgress.isCompleted,
        newlyCompleted: moduleProgress.newlyCompleted
      }
    });

  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to mark lesson as completed',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

// Update current position in course
exports.updateCurrentPosition = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleIndex, lessonIndex } = req.body;
    const userId = req.user.userId || req.user.id;

    // Verify user owns the course
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

    const progress = await Progress.getOrCreateProgress(userId, courseId);
    await progress.updateCurrentPosition(moduleIndex, lessonIndex);

    res.json({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('Update current position error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update current position',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

// Get all user's course progress
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const allProgress = await Progress.getUserProgress(userId);

    res.json({
      success: true,
      data: allProgress
    });

  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user progress',
        code: 'FETCH_ERROR'
      }
    });
  }
};

// Get detailed progress for a course (with module/lesson breakdown)
exports.getDetailedCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Verify user owns the course
    const course = await Course.findOne({ _id: courseId, creator: userId })
      .populate({
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

    const progress = await Progress.getOrCreateProgress(userId, courseId);
    await progress.calculateProgress();

    // Build detailed progress structure
    const detailedProgress = {
      courseId: course._id,
      courseName: course.title,
      overallProgress: progress.progressPercentage,
      currentModule: progress.currentModule,
      currentLesson: progress.currentLesson,
      courseCompleted: progress.courseCompleted,
      totalModules: course.modules.length,
      modules: course.modules.map((module, moduleIndex) => {
        const moduleCompleted = progress.isModuleCompleted(module._id);
        const completedLessonsInModule = module.lessons.filter(lesson => 
          progress.isLessonCompleted(lesson._id)
        ).length;

        return {
          moduleId: module._id,
          moduleIndex,
          title: module.title,
          description: module.description,
          totalLessons: module.lessons.length,
          completedLessons: completedLessonsInModule,
          isCompleted: moduleCompleted,
          progressPercentage: module.lessons.length > 0 
            ? Math.round((completedLessonsInModule / module.lessons.length) * 100)
            : 0,
          lessons: module.lessons.map((lesson, lessonIndex) => ({
            lessonId: lesson._id,
            lessonIndex,
            title: lesson.title,
            isCompleted: progress.isLessonCompleted(lesson._id)
          }))
        };
      })
    };

    res.json({
      success: true,
      data: detailedProgress
    });

  } catch (error) {
    console.error('Get detailed course progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch detailed course progress',
        code: 'FETCH_ERROR'
      }
    });
  }
};

// Helper function to check if a module is completed
async function checkModuleCompletion(progress, moduleId) {
  // Get the module with all its lessons
  const module = await Module.findById(moduleId).populate('lessons');
  
  if (!module || module.lessons.length === 0) {
    return { isCompleted: false, newlyCompleted: false };
  }

  // Check if all lessons in the module are completed
  const allLessonsCompleted = module.lessons.every(lesson => 
    progress.isLessonCompleted(lesson._id)
  );

  // Check if module was already marked as completed
  const wasAlreadyCompleted = progress.isModuleCompleted(moduleId);

  if (allLessonsCompleted && !wasAlreadyCompleted) {
    // Mark module as completed
    await progress.completeModule(moduleId);
    return { isCompleted: true, newlyCompleted: true };
  }

  return { isCompleted: allLessonsCompleted, newlyCompleted: false };
}

module.exports = exports;