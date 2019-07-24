const express = require('express');

const hl7Ctrl = require('./hl7.controller');

const router = express.Router(); // eslint-disable-line new-cap


router.route('/upload')
  /** POST /api/hl7/upload - Upload new HL7 document */
  .post(hl7Ctrl.upload.single('hl7-file'), hl7Ctrl.parseFile);

router.route('/files')
/** GET /api/hl7/files - Retrieves all user files */
  .get(hl7Ctrl.getUserFiles);

router.route('/files/:fileId')
/** GET /api/hl7/files/fileId - Retrieves all parsed messages in a file */
  .get(hl7Ctrl.getParsedMessages);


module.exports = router;
