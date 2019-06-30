const mongoose = require('mongoose');

const ParsedHl7MessageSchema = new mongoose.Schema({
  associatedFile: { type: String, required: true },
  rawMessage: { type: String, required: true },
  parsedMessage: { type: Object, required: true },
}, {
  timestamps: true, // createdAt and updatedAt are done automatically.
});

module.exports = mongoose.model('ParsedHl7', ParsedHl7MessageSchema);
