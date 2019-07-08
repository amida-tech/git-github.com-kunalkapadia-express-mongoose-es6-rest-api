const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const app = require('../../index');

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## File Upload', () => {

  describe('# POST /api/hl7/upload', () => {
    it('should upload a file to /data/hl7-uploads', (done) => {
      request(app)
        .post('/api/hl7/upload')
        .attach('hl7-message', 'data/hl7-sample/500HL7Messages.txt')
        .expect(httpStatus.CREATED)
        .then(() => {
          done();
        })
        .catch(done);
    });

    it('Should not upload a file that it not a .txt extension', (done) => {
      request(app)
        .post('/api/hl7/upload')
        .attach('hl7-message', 'data/hl7-sample/test.json')
        .expect(httpStatus.BAD_REQUEST) // TODO: You shouldn't be testing for a sever error here, test for 400
        .then(() => {
          done();
        })
        .catch(done);
    });
  });
});
