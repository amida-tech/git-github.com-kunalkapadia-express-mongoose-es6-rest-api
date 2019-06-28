const multer = require('multer');
const HL7 = require('./hl7.model');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'data/hl7-uploads'); },
  filename: (req, file, cb) => (cb(null, `${file.originalname}-${Date.now()}`))
});

const upload = multer({ storage });

/**
 * Creates a new Mongoose object for the rile to save in the DB
 * We do this mainly to avoid the (new-cap) rule error from ES6
 */
function newHl7File(fileName) {
  return new HL7({ fileName });
}

/**
 * Utilizing Multer, this function receives a file as a request, and saves the generated file name
 * to the DB.
 */
function uploadFile(req, res, next) {
  const hl7File = newHl7File(req.file.filename);

  hl7File.save()
    .then(() => res.status(httpStatus.CREATED).json(hl7File))
    .catch(() => {
      const err = new APIError(`Error: Failed to save file ${req.file.filename}`, httpStatus.BAD_REQUEST);
      next(err);
    });
}

module.exports = { uploadFile, upload };
