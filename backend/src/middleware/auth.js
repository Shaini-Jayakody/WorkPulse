const AuthService = require('../services/authService');
const { AppError } = require('../utils/errorHandler');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized, no token provided', 401);
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);
    
    // Attach user to request
    req.user = await AuthService.getCurrentUser(decoded.userId);
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = protect;