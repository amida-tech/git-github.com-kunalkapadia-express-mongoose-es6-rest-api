const mongoose = require('mongoose');

const HL7FileUploadSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  parsedHl7Message: [String],
  dateAdded: { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model('Hl7FileUpload', HL7FileUploadSchema);
