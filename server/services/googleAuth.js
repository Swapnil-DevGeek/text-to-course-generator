const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

// Passport Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      // User exists, update last login and return
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Check if user exists with the same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // User exists with same email, link Google account
      user.googleId = profile.id;
      user.authProvider = 'google';
      user.avatar = profile.photos[0]?.value || '';
      user.emailVerified = true; // Google emails are verified
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0]?.value || '',
      authProvider: 'google',
      emailVerified: true, // Google emails are verified
      lastLogin: new Date(),
    });

    await user.save();
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

/**
 * Google OAuth controller methods
 */
const googleAuth = {
  /**
   * Initiate Google OAuth
   */
  authenticate: passport.authenticate('google', {
    scope: ['profile', 'email']
  }),

  /**
   * Handle Google OAuth callback
   */
  callback: (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Google OAuth callback error:', err);
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_error`);
      }

      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
      }

      // Generate JWT tokens
      const { generateTokens } = require('../utils/jwt');
      const tokens = generateTokens(user);

      // Redirect to client with tokens (you might want to use a more secure method)
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const redirectUrl = `${clientUrl}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`;
      
      res.redirect(redirectUrl);
    })(req, res, next);
  },

  /**
   * Link Google account to existing user
   */
  linkAccount: async (req, res) => {
    try {
      const user = req.user;
      
      if (user.googleId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Google account already linked',
            code: 'GOOGLE_ALREADY_LINKED'
          }
        });
      }

      // This would require additional OAuth flow implementation
      // For now, return a placeholder response
      res.json({
        success: true,
        message: 'Google account linking initiated',
        data: {
          authUrl: '/api/auth/google/link' // Placeholder
        }
      });
    } catch (error) {
      console.error('Link Google account error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to link Google account',
          code: 'GOOGLE_LINK_ERROR'
        }
      });
    }
  },

  /**
   * Unlink Google account
   */
  unlinkAccount: async (req, res) => {
    try {
      const user = req.user;
      
      if (!user.googleId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No Google account linked',
            code: 'NO_GOOGLE_ACCOUNT'
          }
        });
      }

      if (user.authProvider === 'google' && !user.password) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Cannot unlink Google account without setting a password first',
            code: 'PASSWORD_REQUIRED'
          }
        });
      }

      user.googleId = undefined;
      if (user.authProvider === 'google') {
        user.authProvider = 'local';
      }
      
      await user.save();

      res.json({
        success: true,
        message: 'Google account unlinked successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Unlink Google account error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to unlink Google account',
          code: 'GOOGLE_UNLINK_ERROR'
        }
      });
    }
  }
};

module.exports = googleAuth;