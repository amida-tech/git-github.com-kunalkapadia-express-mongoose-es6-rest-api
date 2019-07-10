const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const httpStatus = require('http-status');

const APIError = require('../server/helpers/APIError');
const User = require('../server/user/user.model');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
  User.get(jwtPayload.sub).then((user) => {
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  }).catch(err => done(new APIError(err, httpStatus.UNAUTHORIZED), false));
}));
