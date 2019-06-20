const mongoose = require('mongoose');

const HL7FileUploadSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  dateAdded: { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model('HL7', HL7FileUploadSchema);
