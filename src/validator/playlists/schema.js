const Joi = require('joi');

const PlaylistsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  songId: Joi.string().optional(),
});

const AddSongToPlaylistsPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { PlaylistsPayloadSchema, AddSongToPlaylistsPayloadSchema };
