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
