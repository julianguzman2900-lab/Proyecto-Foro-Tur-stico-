const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const google_id = profile.id;
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const name = profile.displayName;

      if (!email) {
        return done(new Error('No email found in Google profile.'));
      }

      // 1. Buscar por google_id
      let user = await User.findByGoogleId(google_id);

      if (!user) {
        // 2. Si no existe por google_id, buscar por email
        user = await User.findByEmail(email);

        if (user) {
          // Si el usuario existe, asociar su google_id
          await User.updateGoogleId(user.id, google_id);
          user.google_id = google_id;
        } else {
          // 3. Si no existe, crear la cuenta automáticamente
          const newUserId = await User.create({
            name,
            email,
            password: null, // Sin contraseña tradicional
            role: 'user',
            status: 'approved',
            google_id
          });
          user = await User.findById(newUserId);
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
