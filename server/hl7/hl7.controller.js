const multer = require('multer');
const mongoose = require('mongoose');
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

function getMessageByid(req, res, next) {
  let error;
  const messageId = req.params.messageId;
  const fileId = req.params.fileId;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    error = new APIError(`Invalid Message Index: ${messageId}`, httpStatus.BAD_REQUEST);
    return next(error);
  }

  return _getMessageByIdOrIndex(messageId, fileId)
    .then((message) => {
      if (message) {
        res.status(httpStatus.OK).json(message);
      } else {
        res.status(httpStatus.NOT_FOUND).json('Message Not found. Check message ID');
      }
    })
    .catch((err => next(new APIError(err, httpStatus.INTERNAL_SERVER_ERROR))));
}

function getMessageByIndex(req, res, next) {
  let error;
  const fileId = req.params.fileId;
  const messageIndex = req.params.indexWithinFile;

  if (!Number.isInteger(parseInt(messageIndex, 10))) {
    error = new APIError(`Invalid Message Index: ${messageIndex}`, httpStatus.BAD_REQUEST);
    return next(error);
  }

  return _getMessageByIdOrIndex(messageIndex, fileId)
    .then((message) => {
      if (message) {
        res.status(httpStatus.OK).json(message);
      } else {
        res.status(httpStatus.NOT_FOUND).json('Message Not found. Check message index');
      }
    })
    .catch((err => next(new APIError(err, httpStatus.INTERNAL_SERVER_ERROR))));
}

function _getMessageByIdOrIndex(value, fileId) {
  let queryValue;
  if (!mongoose.Types.ObjectId.isValid(value) && Number.isInteger(parseInt(value, 10))) {
    queryValue = {
      messageNumWithinFile: value
    };
  } else {
    queryValue = {
      _id: value
    };
  }
  return new Promise((resolve, reject) => {
    Message.findOne({
      $and: [
        queryValue,
        { fileId }
      ]
    })
    .exec((err, message) => {
      if (err) {
        reject(err);
      }
      resolve(message);
    });
  });
}

module.exports = { parseFile, upload, getUserFiles, getMessageByIndex, getMessageByid };
