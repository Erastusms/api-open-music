const { successResponse } = require('../../response');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
    this.exportPlaylistHandler = this.exportPlaylistHandler.bind(this);
  }

  async exportPlaylistHandler(request, reply) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;
    const message = {
      targetEmail: request.payload.targetEmail,
      playlistId,
    };
    
    await this._playlistsService.findPlaylists(playlistId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    this._producerService.sendMessage('export:playlists', JSON.stringify(message));
    
    const responseResult = reply.response(successResponse(undefined, 'Permintaan Anda dalam antrean'));
    return responseResult.code(201);
  }
}

module.exports = ExportsHandler;
