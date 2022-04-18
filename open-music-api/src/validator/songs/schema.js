const Joi = require('joi');
const { MIN_YEAR, CURRENT_YEAR, MAX_LENGTH_STRING } = require('../../constant');

const SongsPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().min(MIN_YEAR).max(CURRENT_YEAR).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().optional(),
  albumId: Joi.string().max(MAX_LENGTH_STRING).optional(),
});

const SongsQuerySchema = Joi.object({
  title: Joi.string().optional(),
  performer: Joi.string().optional(),
});

module.exports = { SongsPayloadSchema, SongsQuerySchema };
