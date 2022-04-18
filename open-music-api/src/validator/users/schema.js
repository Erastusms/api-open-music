const Joi = require('joi');
const { MAX_LENGTH_STRING } = require('../../constant');

const UserPayloadSchema = Joi.object({
  username: Joi.string().max(MAX_LENGTH_STRING).required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

module.exports = { UserPayloadSchema };
