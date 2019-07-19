const multer = require('multer');
const Message = require('./hl7.model');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');
const fs = require('fs');
const Hl7Parser = require('health-level-seven-parser');
const config = require('../../config/config');

const hl7Parser = new Hl7Parser.Hl7Parser();

const uploadedFilePath = config.fileUploadPath;


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadedFilePath);
  },
  filename: (req, file, cb) => {
    // Check if file with the same name already exist in the FS.
    fs.stat(`${uploadedFilePath}/${file.originalname}`, (err) => {
      if (err === null) {
        const error = new APIError('A file with that name already exist', httpStatus.CONFLICT);
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
  const parsedMessage = hl7Parser.getHl7Model(rawHl7Message, true);
  return parsedMessage.children;
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

/**
 * Get list of user files
 * @returns {files[]}
 */
function getUserFiles(req, res, next) {
  if (req.user && req.user.files.length > 0) {
    const files = req.user.files.map((fileObj) => {
      const file = {
        id: fileObj._id,
        name: fileObj.filename.split('/')[fileObj.filename.split('/').length - 1]
      };
      return file;
    });
    return res.status(httpStatus.OK).json(files);
  }

  let err;
  if (req.user.files.length === 0) {
    err = new APIError('User has no files uploaded', httpStatus.NO_CONTENT);
  } else {
    err = new APIError('There was an error retrieving uploaded files', httpStatus.BAD_REQUEST);
  }
  return next(err);
}


module.exports = { parseFile, upload, getUserFiles };
