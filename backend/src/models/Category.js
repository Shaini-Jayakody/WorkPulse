const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category_id: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  },
  color: {
    type: String,
    default: '#6B7280',
    match: [/^#[0-9a-fA-F]{6}$/, 'Please provide a valid hex color code']
  },
  icon: {
    type: String,
    default: '📁'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate category_id
categorySchema.pre('save', async function(next) {
  if (!this.category_id) {
    const prefix = 'CAT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.category_id = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Indexes
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ is_active: 1 });

module.exports = mongoose.model('Category', categorySchema);