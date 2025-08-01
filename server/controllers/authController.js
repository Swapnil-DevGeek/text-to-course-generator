const User = require('../models/User');
const { generateTokens, verifyToken } = require('../utils/jwt');

/**
 * Register a new user with email and password
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'User with this email already exists',
          code: 'USER_ALREADY_EXISTS'
        }
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      authProvider: 'local',
      emailVerified: false, // TODO: Implement email verification
    });

    await user.save();

    // Generate tokens
    const tokens = generateTokens(user);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        tokens
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      }
    });
  }
};

/**
 * Login user with email and password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Check if user registered with Google
    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Please login with Google',
          code: 'USE_GOOGLE_AUTH'
        }
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        tokens
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      }
    });
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token required',
          code: 'REFRESH_TOKEN_REQUIRED'
        }
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: {
        tokens
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED'
        }
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Token refresh failed',
        code: 'TOKEN_REFRESH_ERROR'
      }
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get profile',
        code: 'PROFILE_ERROR'
      }
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = req.user;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Email already in use',
            code: 'EMAIL_ALREADY_EXISTS'
          }
        });
      }
      user.email = email;
      user.emailVerified = false; // TODO: Require re-verification
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR'
      }
    });
  }
};

/**
 * Change user password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Check if user has a password (not Google auth only)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot change password for Google authenticated users',
          code: 'GOOGLE_AUTH_USER'
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        }
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to change password',
        code: 'PASSWORD_CHANGE_ERROR'
      }
    });
  }
};

/**
 * Logout user (client-side token removal)
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // We could implement token blacklisting here if needed
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Logout failed',
        code: 'LOGOUT_ERROR'
      }
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
};