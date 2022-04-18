const { successResponse } = require('../../response');
const { ACTION, getConstAdd, getConstDelete } = require('../../constant');

class PlaylistsHandler {
  constructor(songsService, playlistsService, validator) {
    this._songsService = songsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.addPlaylistHandler = this.addPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
    this.addSongToPlaylistHandler = this.addSongToPlaylistHandler.bind(this);
    this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);

    this.getActivitiesPlaylistHandler = this.getActivitiesPlaylistHandler.bind(this);
  }

  async addPlaylistHandler(request, reply) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id } = request.auth.credentials;
    const playlistsPayload = {
      userId: id,
      name
    };
    const playlistId = await this._playlistsService.addPlaylist(playlistsPayload);
    const responseResult = reply.response(successResponse({ playlistId }, getConstAdd('Playlist')));

    return responseResult.code(201);
  }

  async getPlaylistsHandler(request, reply) {
    const { id } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(id);

    return reply.response(successResponse({ playlists }));
  }

  async deletePlaylistHandler(request, reply) {
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    await this._playlistsService.deletePlaylist(playlistId);

    return reply.response(successResponse(undefined, getConstDelete('Playlist')));
  }

  async addSongToPlaylistHandler(request, reply) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    const { songId } = request.payload;
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;
    const activitiesPayload = {
      playlistId,
      songId,
      userId,
      action: ACTION.ADD
    };

    await this._songsService.getSongById(songId);
    await this._playlistsService.findPlaylists(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._playlistsService.addSongToPlaylist({ playlistId, songId });
    await this._playlistsService.addPlaylistActivities(activitiesPayload);

    const responseResult = reply.response(successResponse(undefined, getConstAdd('Song')));
    return responseResult.code(201);
  }

  async getSongsFromPlaylistHandler(request, reply) {
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.findPlaylists(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const playlist = await this._playlistsService.getSongsFromPlaylistId(playlistId);
    return reply.response(successResponse({ playlist }));
  }

  async deleteSongFromPlaylistHandler(request, reply) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const activitiesPayload = {
      playlistId,
      songId,
      userId,
      action: ACTION.DELETE
    };

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._playlistsService.getSongsFromPlaylistId(playlistId, userId);
    await this._playlistsService.deleteSongFromPlaylist({ playlistId, songId });
    await this._playlistsService.addPlaylistActivities(activitiesPayload);

    return reply.response(successResponse(undefined, getConstDelete('Song from Playlist')));
  }

  async getActivitiesPlaylistHandler(request, reply) {
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.findPlaylists(playlistId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    const activities = await this._playlistsService.getActivitiesPlaylists({ playlistId, userId });
    return reply.response(successResponse({ playlistId, activities }));
  }
}

module.exports = PlaylistsHandler;
