const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
      // Find user in your database and compare password using bcrypt
      // If valid, call done(null, user), otherwise done(null, false)
  }
));

app.use(passport.initialize());
app.use(passport.session());
