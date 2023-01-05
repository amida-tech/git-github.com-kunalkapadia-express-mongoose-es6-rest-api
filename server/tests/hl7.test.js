/* eslint-disable no-undef */
const request = require('supertest');
const httpStatus = require('http-status');
const db = require('../../config/mongo');
const app = require('../../index');

jest.setTimeout(10000);

let testApp;

beforeAll(() => { testApp = request(app); });

/**
 * root level hooks
 */
afterAll((done) => {
  // required because https://github.com/Automattic/db/issues/1251#issuecomment-65793092
  db.models = {};
  db.modelSchemas = {};
  db.connection.close();
  done();
});

const user = {
  username: 'username',
  email: 'mail@mail.mail',
  // deepcode ignore NoHardcodedPasswords/test: For testing purposes
  password: 'Password1'
};

let userToken = '';

describe('## File Upload', () => {
  describe('# POST /api/users', () => {
    it('should create a user', (done) => {
      testApp
        .post('/api/users')
        .send(user)
        .expect(httpStatus.CREATED)
        .then(() => {
          done();
        })
        .catch((err) => done());
    });
    it('should be able to login', (done) => {
      testApp
        .post('/api/users/login')
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          // save the token
          userToken = res.body.token;
          done();
        })
        .catch((err) => done());
    });
  });

  describe('# POST /api/hl7/upload', () => {
    it('should upload a file to /data/hl7-uploads', (done) => {
      testApp
        .post('/api/hl7/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('hl7-file', '../../data/hl7-sample/500HL7Messages.txt')
        .expect(httpStatus.CREATED)
        .then(() => {
          done();
        })
        .catch((err) => done());
    });
    it('should not upload a file with the same name', (done) => {
      testApp
        .post('/api/hl7/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('hl7-file', '../../data/hl7-sample/500HL7Messages.txt')
        .expect(httpStatus.CONFLICT)
        .then(() => {
          done();
        })
        .catch((err) => done());
    });
    it('should return unauthorized without a token', (done) => {
      testApp
        .post('/api/hl7/upload')
        .attach('hl7-file', 'data/test.txt')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          done();
        })
        .catch((err) => done());
    });
    it('Should not upload a file that it not a .txt extension', (done) => {
      testApp
        .post('/api/hl7/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('hl7-file', 'data/test.json')
        .expect(httpStatus.BAD_REQUEST)
        .then(() => {
          done();
        })
        .catch((err) => done());
    });
  });
});

describe('## Retrieve File / Messages', () => {
  describe('# GET /api/hl7/files', () => {
    it('should retrieve all the uploaded files', (done) => {
      testApp
        .get('/api/hl7/files')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.length).toBe(1);
          expect(res.body[0].filename).toBe('500HL7Messages.txt');
          done();
        })
        .catch((err) => done());
    });
  });
  describe('# GET /api/hl7/file/:fileId', () => {
    it('should retrieve one file by its id', (done) => {
      testApp
        .get('/api/hl7/files')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.length).toBe(1);
          const fileId = res.body[0].id;
          const { filename } = res.body[0];
          return testApp
            .get(`/api/hl7/files/${fileId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(httpStatus.OK)
            .then((res2) => {
              expect(res2.body.id).toBe(fileId);
              expect(res2.body.filename).toBe(filename);
            });
        })
        .catch((err) => done());
    });
    it('should fail to retrieve nonexistent file', (done) => {
      testApp
        .get('/api/hl7/files/doesntexist')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(() => done())
        .catch((err) => done());
    });
  });
  describe('# GET /api/hl7/files/fileId/messages/messageIndex', () => {
    it('should retrieve first message using message index ', (done) => {
      testApp
        .get('/api/hl7/files')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
          testApp
            .get(`/api/hl7/files/${res.body[0].id}/messages/${0}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(httpStatus.OK)
            .then((response) => {
              expect(response.body.messageNumWithinFile).toBe(0);
            });
          done();
        })
        .catch((err) => done());
    });
  });
});
