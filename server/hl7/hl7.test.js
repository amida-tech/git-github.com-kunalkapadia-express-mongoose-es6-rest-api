const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
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

const user = {
  username: 'username',
  email: 'mail@mail.mail',
  password: 'Password1'
};
let userToken = '';
before((done) => {
  // create a user
  request(app)
    .post('/api/users')
    .send(user)
    .expect(httpStatus.OK)
    // then sign in
    .then(() => request(app)
      .post('/api/users/login')
      .send(user)
      .expect(httpStatus.OK)
      .then((res) => {
        // save the token
        userToken = res.body.token;
        done();
      })
      .catch(done)
    );
});

describe('## File Upload', () => {
  describe('# POST /api/hl7/upload', () => {
    it('should upload a file to /data/hl7-uploads', (done) => {
      request(app)
        .post('/api/hl7/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('hl7-file', 'data/hl7-sample/500HL7Messages.txt')
        .expect(httpStatus.CREATED)
        .then(() => {
          done();
        })
        .catch(done);
    });
    it('should not upload a file with the same name', (done) => {
      request(app)
        .post('/api/hl7/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('hl7-file', 'data/hl7-sample/500HL7Messages.txt')
        .expect(httpStatus.CONFLICT)
        .then(() => {
          done();
        })
        .catch(done);
    });
    it('should return unauthorized without a token', (done) => {
      request(app)
        .post('/api/hl7/upload')
        .attach('hl7-file', 'server/tests/data/test.txt')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          done();
        })
        .catch(done);
    });
    it('Should not upload a file that it not a .txt extension', (done) => {
      request(app)
        .post('/api/hl7/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('hl7-file', 'server/tests/data/test.json')
        .expect(httpStatus.BAD_REQUEST)
        .then(() => {
          done();
        })
        .catch(done);
    });
  });
});

describe('## Retrieve File / Messages', () => {
  describe('# GET /api/hl7/files', () => {
    it('should retrieve all the uploaded files ', (done) => {
      request(app)
        .get('/api/hl7/files')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.length).equal(1);
          expect(res.body[0].name).equal('500HL7Messages.txt');
          done();
        })
        .catch(done);
    });
  });
  describe('# GET /api/hl7/files/fileId/messages/messageIndex', () => {
    it('should retrieve first message using message index ', (done) => {
      request(app)
        .get('/api/hl7/files')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
          request(app)
            .get(`/api/hl7/files/${res.body[0].id}/messages/${0}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(httpStatus.OK)
            .then((response) => {
              expect(response.body.messageNumWithinFile).equal(0);
              done();
            })
          .catch(done);
        })
        .catch(done);
    });
  });
  describe('# GET /api/hl7/files/fileId/messages', () => {
    it('should retrieve all parsed messages for a given file ', (done) => {
      request(app)
        .get('/api/hl7/files')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
          request(app)
            .get(`/api/hl7/files/${res.body[0].id}/messages`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(httpStatus.OK)
            .then((response) => {
              expect(response.body.length).to.equal(500);
              done();
            })
            .catch(done);
        })
        .catch(done);
    });
  });
});
