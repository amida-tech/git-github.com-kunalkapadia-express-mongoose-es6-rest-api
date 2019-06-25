const User = require('./user.model');
const bcrypt = require('bcrypt');

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.user);
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.email - The email address of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
function create(req, res, next) {
  // First check if username or email already in database
  User.find({
    $or: [
      { email: req.body.email },
      { username: req.body.username }
      // eslint-disable-next-line consistent-return
    ]
    // eslint-disable-next-line consistent-return
  }, (err, docs) => {
    // eslint-disable-next-line eqeqeq
    if (docs.length >= 1) {
      if (docs[0].email === req.body.email) {
        return res.status(409)
          .json({
            message: 'Account with email already exists!'
          });
        // eslint-disable-next-line eqeqeq
      } else if (docs[0].username === req.body.username) {
        return res.status(409)
          .json({
            message: 'Account with username already exists!'
          });
      }
    }
    // If user does not exist, hash password
    // eslint-disable-next-line consistent-return
    bcrypt.hash(req.body.password, 10, (error, hash) => {
      if (error) {
        return res.status(500)
          .json({
            error
          });
      }
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash
      });
      // Save user
      user.save()
        .then(savedUser => res.json(savedUser))
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
  const user = req.user;
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
  const user = req.user;
  user.remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(e => next(e));
}

module.exports = { load, get, create, update, list, remove };
