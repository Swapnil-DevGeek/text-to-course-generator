const mongoose = require('mongoose');

// Define flexible content block schema for different types of content
const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'paragraph',      // Regular text content
      'heading',        // Section headings (h1, h2, h3, etc.)
      'list',          // Ordered or unordered lists
      'code',          // Code blocks with syntax highlighting
      'quote',         // Blockquotes or callouts
      'image',         // Images with captions
      'video',         // Video embeds or links
      'quiz',          // Interactive quiz questions
      'exercise',      // Practice exercises
      'resource',      // External resources/links
      'divider',       // Visual separators
      'callout',       // Important notes or tips
    ],
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Flexible content based on type
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Additional metadata per block type
    default: {},
  },
  order: {
    type: Number,
    default: 0, // Order within the lesson
  },
}, { _id: false }); // Disable _id for subdocuments to keep them simple

const lessonSchema = new mongoose.Schema({
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
  content: {
    type: [contentBlockSchema],
    required: true,
    validate: {
      validator: function(content) {
        return content && content.length > 0;
      },
      message: 'Lesson must have at least one content block'
    },
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  // Additional fields for better lesson management
  order: {
    type: Number,
    default: 0, // Order within the module
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
  resources: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(url) {
          // Basic URL validation
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Invalid URL format'
      },
    },
    type: {
      type: String,
      enum: ['article', 'video', 'book', 'documentation', 'tool', 'other'],
      default: 'article',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  }],
  estimatedDuration: {
    type: String, // e.g., "15 min", "30 min"
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  // AI Enhancement tracking
  isEnriched: {
    type: Boolean,
    default: false, // Track if AI has enhanced this lesson
  },
  enrichmentLevel: {
    type: String,
    enum: ['basic', 'detailed', 'comprehensive'],
    default: 'basic',
  },
  generationMetadata: {
    model: String, // e.g., "gpt-4", "gpt-3.5-turbo"
    generatedAt: Date,
    processingTime: Number, // in milliseconds
    tokensUsed: Number,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
lessonSchema.index({ module: 1 });
lessonSchema.index({ module: 1, order: 1 }); // For ordering lessons within a module
lessonSchema.index({ createdAt: -1 });
lessonSchema.index({ 'content.type': 1 }); // For filtering by content type

// Virtual for content block count
lessonSchema.virtual('contentBlockCount').get(function() {
  return this.content ? this.content.length : 0;
});

// Virtual for estimated reading time based on content
lessonSchema.virtual('estimatedReadingTimeMinutes').get(function() {
  let totalWords = 0;
  
  if (this.content && Array.isArray(this.content)) {
    this.content.forEach(block => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        totalWords += (block.content || '').split(' ').length;
      } else if (block.type === 'list' && Array.isArray(block.content)) {
        block.content.forEach(item => {
          totalWords += (item || '').split(' ').length;
        });
      }
    });
  }
  
  // Average reading speed: 200 words per minute
  return Math.ceil(totalWords / 200) || 1;
});

// Method to add a content block
lessonSchema.methods.addContentBlock = function(blockData) {
  const maxOrder = this.content.reduce((max, block) => 
    Math.max(max, block.order || 0), -1);
  
  const newBlock = {
    ...blockData,
    order: blockData.order !== undefined ? blockData.order : maxOrder + 1,
  };
  
  this.content.push(newBlock);
  return this.save();
};

// Method to remove a content block by index
lessonSchema.methods.removeContentBlock = function(index) {
  if (index >= 0 && index < this.content.length) {
    this.content.splice(index, 1);
    return this.save();
  }
  throw new Error('Invalid content block index');
};

// Method to reorder content blocks
lessonSchema.methods.reorderContentBlocks = function(newOrder) {
  if (newOrder.length !== this.content.length) {
    throw new Error('Invalid reorder: length mismatch');
  }
  
  const reorderedContent = newOrder.map((index, newIndex) => {
    const block = this.content[index];
    return { ...block, order: newIndex };
  });
  
  this.content = reorderedContent;
  return this.save();
};

// Method to get content blocks by type
lessonSchema.methods.getContentBlocksByType = function(type) {
  return this.content.filter(block => block.type === type);
};

// Method to add a resource
lessonSchema.methods.addResource = function(resourceData) {
  this.resources.push(resourceData);
  return this.save();
};

// Method to remove a resource
lessonSchema.methods.removeResource = function(resourceId) {
  this.resources = this.resources.filter(resource => 
    !resource._id.equals(resourceId));
  return this.save();
};

// Static method to find lessons by module
lessonSchema.statics.findByModule = function(moduleId) {
  return this.find({ module: moduleId })
    .sort({ order: 1, createdAt: 1 });
};

// Static method to search lessons by content
lessonSchema.statics.searchByContent = function(searchTerm, options = {}) {
  const query = {
    $or: [
      { title: new RegExp(searchTerm, 'i') },
      { description: new RegExp(searchTerm, 'i') },
      { 'content.content': new RegExp(searchTerm, 'i') },
      { keyTopics: new RegExp(searchTerm, 'i') },
    ]
  };

  if (options.difficulty) {
    query.difficulty = options.difficulty;
  }

  if (options.contentType) {
    query['content.type'] = options.contentType;
  }

  return this.find(query)
    .populate('module')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

// Method to validate content blocks
lessonSchema.methods.validateContentBlocks = function() {
  const errors = [];
  
  this.content.forEach((block, index) => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        if (!block.content || typeof block.content !== 'string') {
          errors.push(`Block ${index}: ${block.type} requires string content`);
        }
        break;
      
      case 'list':
        if (!Array.isArray(block.content)) {
          errors.push(`Block ${index}: list requires array content`);
        }
        break;
      
      case 'code':
        if (!block.content || typeof block.content !== 'string') {
          errors.push(`Block ${index}: code requires string content`);
        }
        break;
      
      case 'quiz':
        if (!block.content.question || !Array.isArray(block.content.options)) {
          errors.push(`Block ${index}: quiz requires question and options array`);
        }
        break;
      
      case 'image':
      case 'video':
        if (!block.content.url) {
          errors.push(`Block ${index}: ${block.type} requires URL`);
        }
        break;
    }
  });
  
  return errors;
};

// Transform output for JSON responses
lessonSchema.methods.toJSON = function() {
  const lesson = this.toObject({ virtuals: true });
  return lesson;
};

// Pre-save middleware to sort content blocks by order
lessonSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Sort content blocks by order
    this.content.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Update isEnriched flag based on content richness
    const hasRichContent = this.content.some(block => 
      ['quiz', 'exercise', 'video', 'code'].includes(block.type));
    
    if (hasRichContent || this.content.length > 3) {
      this.isEnriched = true;
    }
  }
  next();
});

// Post-save middleware to update the parent module
lessonSchema.post('save', async function(doc) {
  try {
    const Module = mongoose.model('Module');
    const module = await Module.findById(doc.module);
    
    if (module && !module.lessons.includes(doc._id)) {
      module.lessons.push(doc._id);
      await module.save();
    }
  } catch (error) {
    console.error('Error updating module after lesson save:', error);
  }
});

// Pre-remove middleware to clean up references
lessonSchema.pre('remove', async function(next) {
  try {
    // Remove this lesson from its parent module
    const Module = mongoose.model('Module');
    await Module.updateOne(
      { _id: this.module },
      { $pull: { lessons: this._id } }
    );
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);