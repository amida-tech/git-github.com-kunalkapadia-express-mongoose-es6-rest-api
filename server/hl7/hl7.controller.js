const multer = require('multer');
const HL7 = require('./hl7.model');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'data/hl7-uploads'); },
  filename: (req, file, cb) => (cb(null, `${file.originalname}-${Date.now()}`))
});

const upload = multer({ storage,
  fileFilter(req, file, cb) {
    if (!file) {
      cb(new Error('No file found', httpStatus.BAD_REQUEST), false); // TODO: Change to return 400 or something if no file found
    }
    if (file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false); // TODO: Change to return 400 or something if wrong extensiom is given
    }
  }
});


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
function uploadFile(req, res) {
  const hl7File = newHl7File(req.file.filename);

  hl7File.save()
    .catch(() => {
      const err = new APIError(`Error: Failed to save file ${req.file.filename}`, httpStatus.BAD_REQUEST);
      res.status(err.status).json(err.message);
    });
  return res.status(httpStatus.CREATED).json(hl7File);
}

module.exports = { uploadFile, upload };
