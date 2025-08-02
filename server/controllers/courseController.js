const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const aiService = require('../services/aiService');

// Generate course with AI
exports.generateCourse = async (req, res) => {
  try {
    const { topic, difficulty = 'Beginner', duration = '4-6 weeks' } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Topic must be at least 3 characters long',
          code: 'INVALID_TOPIC'
        }
      });
    }

    // Generate course with AI
    const aiResult = await aiService.generateCourse(topic.trim(), difficulty, duration);
    
    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate course content',
          code: 'AI_GENERATION_FAILED',
          details: aiResult.error
        }
      });
    }

    const courseData = aiResult.data;

    // Create course in database
    const course = new Course({
      title: courseData.title,
      description: courseData.description,
      creator: userId,
      tags: courseData.tags || [],
      difficulty: courseData.difficulty.toLowerCase(),
      estimatedDuration: courseData.estimatedDuration,
      originalPrompt: topic,
      generationMetadata: courseData.generationMetadata,
      isEnriched: true
    });

    await course.save();

    // Create modules and lessons
    for (let i = 0; i < courseData.modules.length; i++) {
      const moduleData = courseData.modules[i];
      
      const module = new Module({
        title: moduleData.title,
        description: moduleData.description,
        course: course._id,
        order: i,
        estimatedDuration: moduleData.estimatedDuration,
        objectives: moduleData.objectives || [],
        isEnriched: true,
        generationMetadata: courseData.generationMetadata
      });

      await module.save();

      // Create lessons for this module
      for (let j = 0; j < moduleData.lessons.length; j++) {
        const lessonData = moduleData.lessons[j];
        
        const lesson = new Lesson({
          title: lessonData.title,
          description: lessonData.description,
          module: module._id,
          order: j,
          objectives: lessonData.objectives || [],
          estimatedDuration: lessonData.estimatedDuration,
          content: [
            {
              type: 'paragraph',
              content: lessonData.description,
              metadata: {},
              order: 0
            }
          ],
          isEnriched: false, // Will be enriched when lesson content is generated
          generationMetadata: courseData.generationMetadata
        });

        await lesson.save();
        // Lesson's post-save middleware will automatically add lesson to module
      }

      // Module's post-save middleware will automatically add module to course
    }

    // Populate the course with modules and lessons for response
    const populatedCourse = await Course.findById(course._id)
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons'
        }
      });

    res.status(201).json({
      success: true,
      data: populatedCourse
    });

  } catch (error) {
    console.error('Course generation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during course generation',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

// Get all courses for a user
exports.getUserCourses = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { page = 1, limit = 10, search, difficulty } = req.query;

    let query = { creator: userId };

    // Add search filter
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Add difficulty filter
    if (difficulty) {
      query.difficulty = difficulty.toLowerCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(query)
      .populate('modules')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    // Calculate progress for each course (placeholder for now)
    const coursesWithProgress = courses.map(course => ({
      ...course.toJSON(),
      progress: 0 // TODO: Implement progress tracking
    }));

    res.json({
      success: true,
      data: {
        courses: coursesWithProgress,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch courses',
        code: 'FETCH_ERROR'
      }
    });
  }
};

// Get a specific course with modules and lessons
exports.getCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;

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

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch course',
        code: 'FETCH_ERROR'
      }
    });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.creator;
    delete updates.generationMetadata;
    delete updates._id;

    const course = await Course.findOneAndUpdate(
      { _id: courseId, creator: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found',
          code: 'COURSE_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update course',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;

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

    // Delete all modules and lessons associated with this course
    const modules = await Module.find({ course: courseId });
    for (const module of modules) {
      await Lesson.deleteMany({ module: module._id });
      await module.remove();
    }

    await course.remove();

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete course',
        code: 'DELETE_ERROR'
      }
    });
  }
};