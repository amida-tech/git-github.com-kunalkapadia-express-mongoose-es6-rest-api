const Joi = require('joi');
const dotenv = require('dotenv')

// require and configure dotenv, will load vars in .env or .env.test in PROCESS.ENV
if (process.env.NODE_ENV === 'test') {
  console.log('config.js: Using .env.test')
  dotenv.config({ path: '.env.test' });
} else {
  console.log('config.js: Using .env')
  dotenv.config();
}
// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number()
    .default(4040),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('development'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  MONGO_HOST: Joi.string().required()
    .description('Mongo DB host url'),
  MONGO_PORT: Joi.number()
    .default(27017),
  JWT_SECRET: Joi.string().required(),
  JWT_EXP_TIME: Joi.string().required()
    .default('1h')
    .description('Expiration time for JWT'),
  FILE_UPLOAD_PATH: Joi.string().required()
    .default('data/hl7-uploads')
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  mongo: {
    host: envVars.MONGO_HOST,
    port: envVars.MONGO_PORT
  },
  jwtSecret: envVars.JWT_SECRET,
  jwtExpTime: envVars.JWT_EXP_TIME,
  fileUploadPath: envVars.FILE_UPLOAD_PATH
};

module.exports = config;
