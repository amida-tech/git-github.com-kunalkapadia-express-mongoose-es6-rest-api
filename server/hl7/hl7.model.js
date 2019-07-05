const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  indexWithinFile: {
    type: Number,
    required: true,
  },
  rawMessage: {
    type: String,
    required: true,
  },
  parsedMessage: {
    type: Object,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', MessageSchema);
