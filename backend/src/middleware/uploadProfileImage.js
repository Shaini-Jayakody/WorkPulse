const multer = require('multer');
const { AppError } = require('../utils/errorHandler');

const storage = multer.memoryStorage();

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new AppError('Only image files are allowed', 400), false);
  }

  cb(null, true);
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Middleware to handle profile image upload
const uploadProfileImage = (req, res, next) => {
  upload.single('profile_picture')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Profile picture must be smaller than 5MB', 400));
      }

      return next(new AppError(error.message, 400));
    }

    if (error) {
      return next(error);
    }

    next();
  });
};

module.exports = uploadProfileImage;