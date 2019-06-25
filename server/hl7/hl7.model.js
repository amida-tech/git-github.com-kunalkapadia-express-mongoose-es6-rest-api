const mongoose = require('mongoose');

const ParsedHl7MessageSchema = new mongoose.Schema({
  associatedFile: { type: String, required: true },
  rawMessage: { type: String, required: true },
  dateAdded: { type: Date, default: () => Date.now() },
});

const HL7FileUploadSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  parsedMessages: [ParsedHl7MessageSchema],
  dateAdded: { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model('ParsedHl7', ParsedHl7MessageSchema);
module.exports = mongoose.model('HL7', HL7FileUploadSchema);
