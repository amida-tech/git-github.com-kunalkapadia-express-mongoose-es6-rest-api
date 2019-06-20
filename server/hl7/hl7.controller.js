const multer = require('multer');
const Hl7 = require('./hl7.model');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'data/uploads'); },
  filename: (req, file, cb) => (cb(null, `${file.originalname}-${Date.now()}`))
});

const upload = multer({ storage });

function uploadFile(req, res) {

  const hl7 = Hl7({
    fileName: req.file.filename
  });

  hl7.save()
    .catch(() => {
      res.send('I failed');
    });

  return res.send('Successful!');
}

module.exports = { uploadFile, upload };
