const { Joi } = require('express-validation');

module.exports = {
  // POST /api/users
  createUser: {
    body: Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string().regex(/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,}$/).required()
    })
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email({ minDomainSegments: 2 }).required()
    }),
    params: Joi.object({
      userId: Joi.string().hex().required()
    })
  },

  // POST /api/auth/login
  login: {
    body: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required()
    })
  }
};
