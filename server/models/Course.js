const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  creator: {
    type: String,
    required: true,
    // This will store the user's ObjectId as string for compatibility with Auth0 or user._id
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 50,
  }],
  // Additional fields for better course management
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  estimatedDuration: {
    type: String, // e.g., "4 weeks", "2 hours"
    default: '',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isEnriched: {
    type: Boolean,
    default: false, // Track if AI has enhanced the course
  },
  // AI Generation metadata
  originalPrompt: {
    type: String,
    // Store the original user prompt that generated this course
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
courseSchema.index({ creator: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ title: 'text', description: 'text' }); // Text search

// Virtual for module count
courseSchema.virtual('moduleCount').get(function() {
  return this.modules ? this.modules.length : 0;
});

// Virtual to populate modules with lessons count
courseSchema.virtual('modulesWithDetails', {
  ref: 'Module',
  localField: 'modules',
  foreignField: '_id',
  options: { populate: { path: 'lessons' } }
});

// Method to add a module to the course
courseSchema.methods.addModule = function(moduleId) {
  if (!this.modules.includes(moduleId)) {
    this.modules.push(moduleId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove a module from the course
courseSchema.methods.removeModule = function(moduleId) {
  this.modules = this.modules.filter(id => !id.equals(moduleId));
  return this.save();
};

// Method to get total lessons count across all modules
courseSchema.methods.getTotalLessonsCount = async function() {
  await this.populate('modules');
  let totalLessons = 0;
  for (const module of this.modules) {
    if (module.lessons) {
      totalLessons += module.lessons.length;
    }
  }
  return totalLessons;
};

// Static method to find courses by creator
courseSchema.statics.findByCreator = function(creatorId) {
  return this.find({ creator: creatorId }).sort({ createdAt: -1 });
};

// Static method to search courses
courseSchema.statics.searchCourses = function(searchTerm, options = {}) {
  const query = {
    $or: [
      { title: new RegExp(searchTerm, 'i') },
      { description: new RegExp(searchTerm, 'i') },
      { tags: new RegExp(searchTerm, 'i') }
    ]
  };

  if (options.difficulty) {
    query.difficulty = options.difficulty;
  }

  if (options.isPublished !== undefined) {
    query.isPublished = options.isPublished;
  }

  return this.find(query)
    .populate('modules')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

// Transform output for JSON responses
courseSchema.methods.toJSON = function() {
  const course = this.toObject({ virtuals: true });
  return course;
};

// Pre-save middleware to update isEnriched flag
courseSchema.pre('save', function(next) {
  if (this.isModified('modules') && this.modules.length > 0) {
    // Course is considered enriched if it has modules
    this.isEnriched = true;
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);