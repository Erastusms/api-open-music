const Joi = require('joi');
const { MIN_YEAR, CURRENT_YEAR } = require('../../constant');

const AlbumsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().min(MIN_YEAR).max(CURRENT_YEAR).required(),
});

const AlbumsQuerySchema = Joi.object({
  name: Joi.string().optional(),
  year: Joi.number().min(MIN_YEAR).max(CURRENT_YEAR).optional(),
});

const UploadCoverSchema = Joi.object({
  cover: Joi.any().required(),
});

module.exports = { AlbumsPayloadSchema, AlbumsQuerySchema, UploadCoverSchema };
