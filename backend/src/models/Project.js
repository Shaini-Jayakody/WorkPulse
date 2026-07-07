const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  project_id: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  project_name: {
    type: String,
    required: [true, 'Project name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Project name must be at least 2 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    minlength: [2, 'Category must be at least 2 characters'],
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  assigned_users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  budget: {
    type: Number,
    min: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'archived'],
    default: 'planning'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Generate project_id 
projectSchema.pre('save', async function(next) {
  if (!this.project_id) {
    const prefix = 'PRJ';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.project_id = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Indexes for better performance
projectSchema.index({ project_name: 1 }, { unique: true });
projectSchema.index({ category: 1 });
projectSchema.index({ assigned_users: 1 });
projectSchema.index({ is_active: 1 });
projectSchema.index({ status: 1 });

// Virtual for team member count
projectSchema.virtual('team_count').get(function() {
  return this.assigned_users ? this.assigned_users.length : 0;
});

// Virtual for project status display
projectSchema.virtual('status_display').get(function() {
  const statusMap = {
    'planning': 'Planning',
    'active': 'Active',
    'on_hold': 'On Hold',
    'completed': 'Completed',
    'archived': 'Archived'
  };
  return statusMap[this.status] || this.status;
});

// Ensure virtuals are included in JSON output
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);