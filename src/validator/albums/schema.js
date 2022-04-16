const Joi = require('joi');

const AlbumsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

const AlbumsQuerySchema = Joi.object({
  name: Joi.string().optional(),
  year: Joi.number().optional(),
});

module.exports = { AlbumsPayloadSchema, AlbumsQuerySchema };
