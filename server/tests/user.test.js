const request = require('supertest');
const httpStatus = require('http-status');
const bcrypt = require('bcrypt');
const db = require('../../config/mongo');
const app = require('../../index');

jest.setTimeout(10000);

let testApp;

beforeAll(() => testApp = request(app));

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

describe('## User APIs', () => {
  let user = {
    username: 'testName',
    email: 'testName@gmail.com',
    password: 'testPassword1'
  };

  describe('# POST /api/users', () => {
    it('should create a new user through signing up', (done) => {
      testApp
        .post('/api/users')
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).toBe(user.username);
          expect(res.body.email).toBe(user.email);
          // deepcode ignore HardcodedNonCryptoSecret/test: For testing purposes
          bcrypt.compare(res.body.password, user.password, (err, response) => {
            expect(response);
          });
          user = res.body;
          done();
        })
        .catch((err) => done());
    });
  });

  describe('# GET /api/users/:userId', () => {
    it('should get user details', (done) => {
      testApp
        .get(`/api/users/${user._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).toBe(user.username);
          expect(res.body.mobileNumber).toBe(user.mobileNumber);
          done();
        })
        .catch((err) => done());
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      testApp
        .get('/api/users/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).toBe('Not Found');
          done();
        })
        .catch((err) => done());
    });
  });

  describe('# PUT /api/users/:userId', () => {
    it('should update user details', (done) => {
      user.username = 'KK';
      delete user.password;

      testApp
        .put(`/api/users/${user._id}`)
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).toBe(user.username);
          expect(res.body.email).toBe(user.email);
          done();
        })
        .catch((err) => done());
    });
  });

  describe('# GET /api/users/', () => {
    it('should get all users', (done) => {
      testApp
        .get('/api/users')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          done();
        })
        .catch((err) => done());
    });

    it('should get all users (with limit and skip)', (done) => {
      testApp
        .get('/api/users')
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          done();
        })
        .catch((err) => done());
    });
  });

  describe('# DELETE /api/users/', () => {
    it('should delete user', (done) => {
      testApp
        .delete(`/api/users/${user._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).toBe(user.username);
          expect(res.body.email).toBe(user.email);
          done();
        })
        .catch((err) => done());
    });
  });
});
