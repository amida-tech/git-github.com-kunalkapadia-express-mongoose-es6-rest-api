const multer = require('multer');
const HL7 = require('./hl7.model');
const ParsedHl7 = require('./hl7.model');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'data/hl7-uploads'); },
  filename: (req, file, cb) => {

    // validate the file
    // read the file
    // parse the file
    // save the parsed data to ParsedHl7MessageSchema
    // save the file name along with parsed ID's to HL7FileUploadSchema
    // use the file name to save the file to the file system
    saveFileToDB(file.originalname)

    cb(null, `${file.originalname}-${Date.now()}`);
  }
});

const upload = multer({ storage });


function validateFile(file) {
  

}

/**
 * Creates a new Mongoose object for the rile to save in the DB
 * We do this mainly to avoid the (new-cap) rule error from ES6
 */
function newHl7File(filename) {
  return new HL7({ filename });
}

function newParsedHl7Message(associatedFilename, rawMessage) {
  return new ParsedHl7({ associatedFilename, rawMessage });
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
      return res.status(err.status).json(err.message);
    });
  return res.status(httpStatus.CREATED).json(hl7File);
}

function saveFileToDB(associatedFilename, rawMessage) {
  const parsedMessage = newParsedHl7Message(associatedFilename, rawMessage);

  parsedMessage.save()
    .catch(() => {
      return { statusCode: 400, message: 'Did not save' };
    });
  return { statusCode: 200, file: hl7File  };
}

module.exports = { uploadFile, upload };
