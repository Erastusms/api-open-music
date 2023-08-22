const Joi = require('joi');
const { MAX_LENGTH_STRING } = require('../../constant');

const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().max(MAX_LENGTH_STRING).required(),
  password: Joi.string().required(),
});

const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
};
