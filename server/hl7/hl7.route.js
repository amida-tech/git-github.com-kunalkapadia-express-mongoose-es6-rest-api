const express = require('express');
const hl7Ctrl = require('./hl7.controller');

const router = express.Router(); // eslint-disable-line new-cap


router.route('/upload')
  /** POST /api/hl7/upload - Upload new HL7 document */
  .post(hl7Ctrl.upload.single('hl7-file'), hl7Ctrl.parseFile);

module.exports = router;
