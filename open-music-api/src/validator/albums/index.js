const InvariantError = require('../../exceptions/InvariantError');
const { AlbumsPayloadSchema, AlbumsQuerySchema, UploadCoverSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumsPayload: (payload) => {
    const validationResult = AlbumsPayloadSchema.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
  validateAlbumsQuery: (query) => {
    const validationResult = AlbumsQuerySchema.validate(query);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
  validateUploadCover: (query) => {
    const validationResult = UploadCoverSchema.validate(query);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
};

module.exports = AlbumsValidator;
