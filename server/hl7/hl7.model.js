const mongoose = require('mongoose');

const HL7FileUploadSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  dateAdded: { type: Date, default: () => Date.now() },
});

const ParsedHl7MessageSchema = new mongoose.Schema({
  associatedFile: { type: String, required: true },
  rawMessage: { type: String, required: true },
  parsedMessage: { type: Object, required: true },
  dateAdded: { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model('HL7', HL7FileUploadSchema);
module.exports = mongoose.model('ParsedHl7', ParsedHl7MessageSchema);
