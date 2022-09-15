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
  /** GET /api/hl7/files/fileId -
   * Retrieves single file given it's id */
  .get(hl7Ctrl.getFile);

router.route('/files/:fileId/messages/:indexWithinFile')
  /** GET /api/hl7/files/fileId/messages/messageIndex -
   * Retrieves single message from file based on index */
  .get(hl7Ctrl.getMessageByIndex);

router.route('/files/:fileId/messages/:messageId')
  /** GET /api/hl7/files/fileId/messages/messageId -
   * Retrieves single message from file based on ID */
  .get(hl7Ctrl.getMessageByid);

module.exports = router;
