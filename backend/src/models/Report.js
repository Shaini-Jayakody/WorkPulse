const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  report_id: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required']
  },
  end_date: {
    type: Date,
    required: [true, 'End date is required']
  },
  project: {
    type: String,
    required: [true, 'Project is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  tasks_completed: [{
    type: String,
    trim: true
  }],
  tasks_planned: [{
    type: String,
    trim: true
  }],
  blockers: [{
    type: String,
    trim: true
  }],
  worked_hours: {
    type: Number,
    min: 0,
    max: 168,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  links: [{
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please provide a valid URL']
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'late'],
    default: 'draft'
  },
  submitted_at: {
    type: Date
  },
  week_number: {
    type: Number
  },
  year: {
    type: Number
  }
}, {
  timestamps: true
});

// Generate report_id 
reportSchema.pre('save', async function(next) {
  // Only generate if not exists
  if (!this.report_id) {
    const prefix = 'RPT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.report_id = `${prefix}${timestamp}${random}`;
  }

  // Auto-calculate week number and year from start_date
  if (this.start_date) {
    const date = new Date(this.start_date);
    this.week_number = getWeekNumber(date);
    this.year = date.getFullYear();
  }

  next();
});

//function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Indexes
reportSchema.index({ user_id: 1, start_date: -1 });
reportSchema.index({ user_id: 1, status: 1 });
reportSchema.index({ project: 1 });
reportSchema.index({ week_number: 1, year: 1 });
reportSchema.index({ report_id: 1 }, { unique: true });

// Virtual for full date range string
reportSchema.virtual('date_range').get(function() {
  const start = new Date(this.start_date).toLocaleDateString();
  const end = new Date(this.end_date).toLocaleDateString();
  return `${start} - ${end}`;
});

// Virtual for week display
reportSchema.virtual('week_display').get(function() {
  return `Week ${this.week_number}, ${this.year}`;
});

// Ensure virtuals are included in JSON output
reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Report', reportSchema);