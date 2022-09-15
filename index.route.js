const express = require('express');
const passport = require('passport');

const userRoutes = require('./server/user/user.route');
const hl7Routes = require('./server/hl7/hl7.route');

const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => res.send('OK'));

// mount user routes at /users
router.use('/users', userRoutes);

// mount hl7 routes to /hl7
router.use('/hl7', passport.authenticate('jwt', { session: false }), hl7Routes);

module.exports = router;
