const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
  }],
  // Additional fields for better module management
  order: {
    type: Number,
    default: 0, // Order within the course
  },
  estimatedDuration: {
    type: String, // e.g., "2 hours", "1 week"
    default: '',
  },
  objectives: [{
    type: String,
    trim: true,
    maxlength: 200,
  }],
  keyTopics: [{
    type: String,
    trim: true,
    maxlength: 100,
  }],
  // AI Generation metadata
  isEnriched: {
    type: Boolean,
    default: false, // Track if AI has enhanced this module
  },
  generationMetadata: {
    model: String, // e.g., "gpt-4", "gpt-3.5-turbo"
    generatedAt: Date,
    processingTime: Number, // in milliseconds
  },
}, {
  timestamps: true,
});

// Indexes for better performance
moduleSchema.index({ course: 1 });
moduleSchema.index({ course: 1, order: 1 }); // For ordering modules within a course
moduleSchema.index({ createdAt: -1 });

// Virtual for lesson count
moduleSchema.virtual('lessonCount').get(function() {
  return this.lessons ? this.lessons.length : 0;
});

// Virtual to populate lessons with full details
moduleSchema.virtual('lessonsWithDetails', {
  ref: 'Lesson',
  localField: 'lessons',
  foreignField: '_id',
});

// Method to add a lesson to the module
moduleSchema.methods.addLesson = function(lessonId) {
  if (!this.lessons.includes(lessonId)) {
    this.lessons.push(lessonId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove a lesson from the module
moduleSchema.methods.removeLesson = function(lessonId) {
  this.lessons = this.lessons.filter(id => !id.equals(lessonId));
  return this.save();
};

// Method to reorder lessons within the module
moduleSchema.methods.reorderLessons = function(lessonIds) {
  // Validate that all provided lesson IDs exist in the module
  const currentLessonIds = this.lessons.map(id => id.toString());
  const providedIds = lessonIds.map(id => id.toString());
  
  const isValidReorder = providedIds.length === currentLessonIds.length &&
    providedIds.every(id => currentLessonIds.includes(id));
  
  if (isValidReorder) {
    this.lessons = lessonIds;
    return this.save();
  }
  
  throw new Error('Invalid lesson IDs provided for reordering');
};

// Static method to find modules by course
moduleSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId })
    .sort({ order: 1, createdAt: 1 })
    .populate('lessons');
};

// Static method to get modules with lesson count
moduleSchema.statics.findByCourseWithStats = function(courseId) {
  return this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    {
      $lookup: {
        from: 'lessons',
        localField: 'lessons',
        foreignField: '_id',
        as: 'lessonsDetails'
      }
    },
    {
      $addFields: {
        lessonCount: { $size: '$lessonsDetails' },
        totalContentBlocks: {
          $sum: {
            $map: {
              input: '$lessonsDetails',
              as: 'lesson',
              in: { $size: { $ifNull: ['$$lesson.content', []] } }
            }
          }
        }
      }
    },
    { $sort: { order: 1, createdAt: 1 } }
  ]);
};

// Method to get estimated reading time based on lessons
moduleSchema.methods.getEstimatedReadingTime = async function() {
  await this.populate('lessons');
  
  let totalWords = 0;
  this.lessons.forEach(lesson => {
    if (lesson.content && Array.isArray(lesson.content)) {
      lesson.content.forEach(block => {
        if (block.type === 'paragraph' || block.type === 'text') {
          totalWords += (block.content || '').split(' ').length;
        }
      });
    }
  });
  
  // Average reading speed: 200 words per minute
  const estimatedMinutes = Math.ceil(totalWords / 200);
  
  if (estimatedMinutes < 60) {
    return `${estimatedMinutes} min`;
  } else {
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
};

// Transform output for JSON responses
moduleSchema.methods.toJSON = function() {
  const module = this.toObject({ virtuals: true });
  return module;
};

// Pre-save middleware to update isEnriched flag
moduleSchema.pre('save', function(next) {
  if (this.isModified('lessons') && this.lessons.length > 0) {
    // Module is considered enriched if it has lessons
    this.isEnriched = true;
  }
  next();
});

// Post-save middleware to update the parent course
moduleSchema.post('save', async function(doc) {
  try {
    const Course = mongoose.model('Course');
    const course = await Course.findById(doc.course);
    
    if (course && !course.modules.includes(doc._id)) {
      course.modules.push(doc._id);
      await course.save();
    }
  } catch (error) {
    console.error('Error updating course after module save:', error);
  }
});

// Pre-remove middleware to clean up references
moduleSchema.pre('remove', async function(next) {
  try {
    // Remove this module from its parent course
    const Course = mongoose.model('Course');
    await Course.updateOne(
      { _id: this.course },
      { $pull: { modules: this._id } }
    );
    
    // Remove all lessons associated with this module
    const Lesson = mongoose.model('Lesson');
    await Lesson.deleteMany({ module: this._id });
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Module', moduleSchema);