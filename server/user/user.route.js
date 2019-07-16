const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const userCtrl = require('./user.controller');

const router = new express.Router();

router.route('/')
  /** GET /api/users - Get list of users */
  .get(userCtrl.list)
/** POST /api/users - Create new user through signup */
  .post(validate(paramValidation.createUser), userCtrl.create);

router.route('/:userId')
  /** GET /api/users/:userId - Get user */
  .get(userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(validate(paramValidation.updateUser), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(userCtrl.remove);

router.route('/login')
/** POST /api/users/login - Logs in existing user */
  .post(userCtrl.login);


router.param('userId', userCtrl.load);

module.exports = router;
