const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { APPROVAL_STATUS, ROLES } = require('../utils/constants');

const GENDER_OPTIONS = ['male', 'female', 'other', 'prefer_not_to_say'];

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    trim: true
  },
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
  type: String,
  required: [true, 'Email is required'],
  unique: true,
  trim: true,
  lowercase: true,
  match: [
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
    'Please provide a valid email'
  ]
},
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: [ROLES.TEAM_MEMBER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    default: 'team_member',
    required: true
  },
  birthday: {
    type: Date,
    required: [true, 'Birthday is required']
  },
  gender: {
    type: String,
    enum: GENDER_OPTIONS,
    required: [true, 'Gender is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [250, 'Address cannot exceed 250 characters']
  },
  team_no: {
    type: String,
    required: [true, 'Team number is required'],
    trim: true,
    maxlength: [50, 'Team number cannot exceed 50 characters']
  },
  contact_no: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^\+?[\d\s-]{10,15}$/, 'Please provide a valid contact number']
  },
  approval_status: {
    type: String,
    enum: Object.values(APPROVAL_STATUS),
    default: APPROVAL_STATUS.PENDING_MANAGER
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approved_at: {
    type: Date,
    default: null
  },
  rejection_reason: {
    type: String,
    trim: true,
    default: ''
  },
  profile_picture_url: {
    type: String,
    trim: true,
    default: ''
  },
  profile_picture_public_id: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
}, {
  timestamps: true
});

userSchema.pre('validate', function(next) {
  if (!this.birthday) {
    return next();
  }

  const birthDate = new Date(this.birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  if (age < 18) {
    this.invalidate('birthday', 'User must be at least 18 years old');
  }

  next();
});

// Generate user_id 
userSchema.pre('save', async function(next) {
  // Only generate if not exist
  if (!this.user_id) {
    // Generate user_id (first letter of first_name + last_name + timestamp)
    const prefix = `${this.first_name.charAt(0)}${this.last_name}`.toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.user_id = `${prefix}${timestamp}`;
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Virtual for full name
userSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

userSchema.virtual('age').get(function() {
  if (!this.birthday) {
    return null;
  }

  const birthDate = new Date(this.birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);