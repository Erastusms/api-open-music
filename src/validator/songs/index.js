const InvariantError = require('../../exceptions/InvariantError');
const { SongsPayloadSchema, SongsQuerySchema } = require('./schema');

const SongsValidator = {
  validateSongsPayload: (payload) => {
    const validationResult = SongsPayloadSchema.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
  validateSongsQuery: (query) => {
    const validationResult = SongsQuerySchema.validate(query);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
};

module.exports = SongsValidator;
