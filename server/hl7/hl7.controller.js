const multer = require('multer');
const Hl7FileUpload = require('./models/file-upload');
const ParsedHl7 = require('./models/parsed-message');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/hl7-uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  }
});

const upload = multer({ storage });

/**
 * Creates a new Mongoose object for the file to save in the DB
 * We do this mainly to avoid the (new-cap) rule error from ES6
 */
function newHl7File(filename, parsedHl7MessageIds) {
  return new Hl7FileUpload({ filename, parsedHl7Message: parsedHl7MessageIds });
}

/**
 * Creates a new Mongoose object for the parsed message to save in the DB
 * We do this mainly to avoid the (new-cap) rule error from ES6
 */
function newParsedHl7Message(associatedFile, rawMessage, parsedMessage) {
  return new ParsedHl7({ associatedFile, rawMessage, parsedMessage });
}

/**
 * Takes in a raw hl7 message or a list of raw messages and returns a list of the parsed message
 */
function parseRawHl7(rawHl7Message) {
  // TODO: Implement this function
  return {
    ADT: rawHl7Message
  };
}

/**
 * Reads a file from a specified path and returns a list of hl7 messages
 * @param filePath
 * @returns {*}
 */
function readFile(filePath) {
  // TODO: Aditya move your code in here and modify accordingly.
  return filePath;
};

/**
 * Utilizing Multer, this function receives a file as a request, and saves the generated file name
 * to the DB.
 */
function uploadFile(req, res) {

  // TODO: Create function to readfile and return list of hl7 messages- we can just use what Aditya wrote (with some slight modification)
  // const hl7Text = readFile(req.file.path) // TODO: Uncomment this after function has been implemented


  fs.readFile(req.file.path, 'utf8', (fsErr, data) => {
    if (fsErr) {
      // At this point, even if the file isn't read here, it has
      // already been saved to the file system. So we would want to
      // handle that situation somehow.
      // TODO: Handle case where file isn't read but has been saved to the FS.
      const error = new APIError(fsErr, httpStatus.BAD_REQUEST);
      return res.status(error.status).json(fsErr.message);
    }

    // TODO: Loop over raw messages and parse them
    const hl7MessageList = data
      .replace(/\n\r/g, '\n')
      .replace(/\r/g, '\n')
      .split(/\n{2,}/g);

    hl7MessageList.forEach((message) => {
      // TODO: Parse each message in the read-in file.
      const parsedHl7Message = parseRawHl7(message);
      // save the parsed data to ParsedHl7MessageSchema
      const parsedHl7 = newParsedHl7Message(req.file.filename, data, parsedHl7Message);
      parsedHl7.save()
        .then((savedParsedMessage) => {
          // save the file name along with parsed ID's to HL7FileUploadSchema
          const hl7File = newHl7File(req.file.filename, [savedParsedMessage._id]);
          hl7File.save()
            .catch(() => {
              const err = new APIError(`Error: Failed to save file ${req.file.filename}`, httpStatus.BAD_REQUEST);
              return res.status(err.status).json(err.message);
            });
          return res.status(httpStatus.CREATED).json(hl7File);
        })
        .catch((error) => {
          const err = new APIError(`Error: Failed to save parsed message: ${error.message}`, httpStatus.BAD_REQUEST);
          return res.status(err.status).json(error);
        });
    });
  });
}


module.exports = { uploadFile, upload, };
