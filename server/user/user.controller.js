const User = require('./user.model');
const bcrypt = require('bcrypt');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      // eslint-disable-next-line no-param-reassign
      req.otherUser = user;
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.otherUser);
}

function login(req, res, next) {
  User.findOne({ username: req.body.username }, (error, doc) => {
    if (!doc) {
      const error1 = new APIError('Error: Authorization Failed!', httpStatus.UNAUTHORIZED);
      next(error1);
      return;
    }
    bcrypt.compare(req.body.password, doc.password, (err, result) => {
      if (err || !result) {
        const error2 = new APIError('Error: Authorization Failed! ', httpStatus.UNAUTHORIZED);
        return next(error2);
      }
      const token = jwt.sign(
        {
          username: doc.username,
          id: doc._id
        },
        config.jwtSecret,
        {
          expiresIn: '1h'
        });
      return res.status(httpStatus.OK).json({ token });
    });
  });
}


/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.email - The email address of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
function create(req, res, next) {
  /*
  TODO: Need to filter out password in login/signup express log
   */
  // First check if username or email already in database
  User.find({
    $or: [
      { email: req.body.email },
      { username: req.body.username }
    ]
  }, (err, docs) => {
    if (docs.length >= 1) {
      if (docs[0].email === req.body.email) {
        const error = new APIError(`Error: Account with email already exists! ${req.body.email}`, httpStatus.CONFLICT);
        next(error);
        return;
      }
      const error = new APIError(`Error: Account with username already exists! ${req.body.username}`, httpStatus.CONFLICT);
      next(error);
      return;
    }
    // If user does not exist, hash password
    bcrypt.hash(req.body.password, 10, (error, hash) => {
      if (error) {
        const error2 = new APIError('Error: Password hashing failed!', httpStatus.INTERNAL_SERVER_ERROR);
        return next(error2);
      }
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash
      });
      // Save user
      return user.save()
        .then(savedUser =>
          res.json({ username: savedUser.username,
            email: savedUser.email,
            _id: savedUser._id
          }))
        .catch(e => next(e));
    });
  });
}


/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
function update(req, res, next) {
  const user = req.otherUser;
  user.username = req.body.username;
  user.email = req.body.email;

  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const user = req.otherUser;
  user.remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(e => next(e));
}

module.exports = { load, get, create, update, list, remove, login };
