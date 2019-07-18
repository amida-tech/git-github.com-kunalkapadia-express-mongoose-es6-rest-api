const multer = require('multer');
const Message = require('./hl7.model');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');
const fs = require('fs');

const uploadedFilePath = 'data/hl7-uploads';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadedFilePath);
  },
  filename: (req, file, cb) => {
    // Check if file with the same name already exist in the FS.
    fs.stat(`${uploadedFilePath}/${file.originalname}`, (err) => {
      if (err === null) {
        const error = new APIError('File with that name already exist', httpStatus.CONFLICT);
        cb(error, false);
      }
      cb(null, `${file.originalname}`);
    });
  }
});

const upload = multer({ storage,
  fileFilter(req, file, cb) {
    if (!file) {
      cb(new APIError('No file found', httpStatus.BAD_REQUEST), false);
    }
    if (file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new APIError('File type not supported', httpStatus.BAD_REQUEST), false);
    }
  }
});


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
 * Utilizing Multer, this function receives a file as a request, and saves the generated file name
 * to the DB.
 */
function parseFile(req, res, next) {
  new Promise((resolve, reject) => {
    fs.readFile(req.file.path, 'utf8', (fsErr, data) =>
      (fsErr ? reject(fsErr) : resolve(data))
    );
  }).catch(err =>
    next(new APIError(err, httpStatus.BAD_REQUEST))
  ).then((data) => {
    req.user.files.unshift({ filename: req.file.path });
    const newFile = req.user.files[0];
    return Promise.all([data, newFile, req.user.save()]);
  }).then(([data, file]) => {
    const hl7MessageList = data
      .replace(/\n\r/g, '\n')
      .replace(/\r/g, '\n')
      .split(/\n{2,}/g);

    return Message.create(hl7MessageList.filter(rawMessage => !!rawMessage)
      .map((rawMessage, messageNumWithinFile) => ({
        fileId: file._id,
        messageNumWithinFile,
        rawMessage,
        parsedMessage: parseRawHl7(rawMessage),
      })
    ));
  })
  .then(() => res.status(201).end())
  .catch(err => next(new APIError(err, httpStatus.INTERNAL_SERVER_ERROR)));
}

module.exports = { parseFile, upload };
