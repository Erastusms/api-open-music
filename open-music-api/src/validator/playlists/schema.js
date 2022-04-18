const Joi = require('joi');
const { MAX_LENGTH_STRING } = require('../../constant');

const PlaylistsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  songId: Joi.string().max(MAX_LENGTH_STRING).optional(),
});

const AddSongToPlaylistsPayloadSchema = Joi.object({
  songId: Joi.string().max(MAX_LENGTH_STRING).required(),
});

module.exports = { PlaylistsPayloadSchema, AddSongToPlaylistsPayloadSchema };
