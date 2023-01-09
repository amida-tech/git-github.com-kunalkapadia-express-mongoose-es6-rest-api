/* eslint-disable no-undef */
const request = require('supertest');
const httpStatus = require('http-status');
const db = require('../../config/mongo');
const app = require('../../index');

jest.setTimeout(10000);

let testApp;

beforeAll(() => { testApp = request(app); });

afterAll((done) => {
  // required because https://github.com/Automattic/db/issues/1251#issuecomment-65793092
  db.models = {};
  db.modelSchemas = {};
  db.connection.close();
  done();
});

describe('## Misc', () => {
  describe('# GET /api/health-check', () => {
    it('should return OK', (done) => {
      testApp
        .get('/api/health-check')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.text).toBe('OK');
          done();
        })
        .catch((err) => done());
    });
  });

  describe('# GET /api/404', () => {
    it('should return 404 status', (done) => {
      testApp
        .get('/api/404')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).toBe('Not Found');
          done();
        })
        .catch((err) => done());
    });
  });

  describe('# Error Handling', () => {
    it('should handle mongoose CastError - Cast to ObjectId failed', (done) => {
      testApp
        .get('/api/users/56z787zzz67fc')
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then((res) => {
          expect(res.body.message).toBe('Internal Server Error');
          done();
        })
        .catch((err) => done());
    });

    it('should handle express validation error - username is required', (done) => {
      testApp
        .post('/api/users')
        .send({
          // deepcode ignore NoHardcodedPasswords/test: testing data
          password: 'temp12345',
          // deepcode ignore NoHardcodedCredentials/test: testing data
          email: 'temp@gmail.com'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).toBe('"username" is required');
          done();
        })
        .catch((err) => done());
    });
  });
});
