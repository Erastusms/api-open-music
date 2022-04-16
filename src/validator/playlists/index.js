const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistsPayloadSchema, AddSongToPlaylistsPayloadSchema } = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistsPayloadSchema.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
  validatePlaylistSongsPayload: (payload) => {
    const validationResult = AddSongToPlaylistsPayloadSchema.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
};

module.exports = PlaylistsValidator;
