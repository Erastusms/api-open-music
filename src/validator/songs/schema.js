const Joi = require('joi');

const SongsPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().optional(),
  albumId: Joi.string().optional(),
});

const SongsQuerySchema = Joi.object({
  title: Joi.string().optional(),
  performer: Joi.string().optional(),
});

module.exports = { SongsPayloadSchema, SongsQuerySchema };