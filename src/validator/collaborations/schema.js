const Joi = require('joi');
const { MAX_LENGTH_STRING } = require('../../constant');

const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().max(MAX_LENGTH_STRING).required(),
  userId: Joi.string().max(MAX_LENGTH_STRING).required(),
});

module.exports = { CollaborationPayloadSchema };
