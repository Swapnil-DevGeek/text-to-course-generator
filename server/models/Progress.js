const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    // Store user ID as string for compatibility with Auth0 or user._id
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  // Track progress at different levels
  completedLessons: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpent: {
      type: Number, // Time spent in minutes
      default: 0,
    }
  }],
  completedModules: [{
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  // Course completion
  courseCompleted: {
    type: Boolean,
    default: false,
  },
  courseCompletedAt: {
    type: Date,
  },
  // Current position in course
  currentModule: {
    type: Number,
    default: 0, // Module index
  },
  currentLesson: {
    type: Number,
    default: 0, // Lesson index within current module
  },
  // Overall progress percentages
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  // Last accessed
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient querying
progressSchema.index({ user: 1, course: 1 }, { unique: true }); // One progress record per user per course
progressSchema.index({ user: 1 });
progressSchema.index({ course: 1 });
progressSchema.index({ 'completedLessons.lesson': 1 });

// Virtual for total completed lessons count
progressSchema.virtual('totalCompletedLessons').get(function() {
  return this.completedLessons.length;
});

// Virtual for total completed modules count
progressSchema.virtual('totalCompletedModules').get(function() {
  return this.completedModules.length;
});

// Method to mark a lesson as completed
progressSchema.methods.completeLesson = function(lessonId, timeSpent = 0) {
  // Check if lesson is already completed
  const existingIndex = this.completedLessons.findIndex(
    cl => cl.lesson.toString() === lessonId.toString()
  );
  
  if (existingIndex === -1) {
    this.completedLessons.push({
      lesson: lessonId,
      completedAt: new Date(),
      timeSpent: timeSpent
    });
  } else {
    // Update time spent if lesson already completed
    this.completedLessons[existingIndex].timeSpent += timeSpent;
  }
  
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to mark a module as completed
progressSchema.methods.completeModule = function(moduleId) {
  // Check if module is already completed
  const existingIndex = this.completedModules.findIndex(
    cm => cm.module.toString() === moduleId.toString()
  );
  
  if (existingIndex === -1) {
    this.completedModules.push({
      module: moduleId,
      completedAt: new Date()
    });
  }
  
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to check if a lesson is completed
progressSchema.methods.isLessonCompleted = function(lessonId) {
  return this.completedLessons.some(
    cl => cl.lesson.toString() === lessonId.toString()
  );
};

// Method to check if a module is completed
progressSchema.methods.isModuleCompleted = function(moduleId) {
  return this.completedModules.some(
    cm => cm.module.toString() === moduleId.toString()
  );
};

// Method to update current position
progressSchema.methods.updateCurrentPosition = function(moduleIndex, lessonIndex) {
  this.currentModule = moduleIndex;
  this.currentLesson = lessonIndex;
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to calculate and update progress percentage
progressSchema.methods.calculateProgress = async function() {
  await this.populate('course');
  
  if (!this.course) {
    this.progressPercentage = 0;
    return this.save();
  }
  
  // Get total lessons in course
  const Course = mongoose.model('Course');
  const courseWithModules = await Course.findById(this.course._id)
    .populate({
      path: 'modules',
      populate: {
        path: 'lessons'
      }
    });
  
  let totalLessons = 0;
  courseWithModules.modules.forEach(module => {
    totalLessons += module.lessons.length;
  });
  
  if (totalLessons === 0) {
    this.progressPercentage = 0;
  } else {
    this.progressPercentage = Math.round((this.completedLessons.length / totalLessons) * 100);
  }
  
  // Check if course is completed
  if (this.progressPercentage === 100 && !this.courseCompleted) {
    this.courseCompleted = true;
    this.courseCompletedAt = new Date();
  }
  
  return this.save();
};

// Static method to get or create progress for user and course
progressSchema.statics.getOrCreateProgress = async function(userId, courseId) {
  let progress = await this.findOne({ user: userId, course: courseId });
  
  if (!progress) {
    progress = new this({
      user: userId,
      course: courseId,
      completedLessons: [],
      completedModules: [],
      currentModule: 0,
      currentLesson: 0,
      progressPercentage: 0
    });
    await progress.save();
  }
  
  return progress;
};

// Static method to get progress with course details
progressSchema.statics.getProgressWithDetails = function(userId, courseId) {
  return this.findOne({ user: userId, course: courseId })
    .populate('course')
    .populate('completedLessons.lesson')
    .populate('completedModules.module');
};

// Static method to get all user's course progress
progressSchema.statics.getUserProgress = function(userId) {
  return this.find({ user: userId })
    .populate('course')
    .sort({ lastAccessedAt: -1 });
};

// Pre-save middleware to update lastAccessedAt
progressSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('lastAccessedAt')) {
    this.lastAccessedAt = new Date();
  }
  next();
});

// Transform output for JSON responses
progressSchema.methods.toJSON = function() {
  const progress = this.toObject({ virtuals: true });
  return progress;
};

module.exports = mongoose.model('Progress', progressSchema);