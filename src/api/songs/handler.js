const { successResponse } = require('../../response/BaseResponse');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.addSongHandler = this.addSongHandler.bind(this);
    this.getSongHandler = this.getSongHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.editSongByIdHandler = this.editSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async addSongHandler(request, reply) {
    this._validator.validateSongsPayload(request.payload);
    const songId = await this._service.addSong(request.payload);
    const responseResult = reply.response(successResponse({ songId }, 'Song berhasil ditambahkan'));

    return responseResult.code(201);
  }

  async getSongHandler(request, reply) {
    this._validator.validateSongsQuery(request.query);
    const songs = await this._service.getSongs(request.query);
    return reply.response(successResponse({ songs }));
  }

  async getSongByIdHandler(request, reply) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return reply.response(successResponse({ song }));
  }

  async editSongByIdHandler(request, reply) {
    this._validator.validateSongsPayload(request.payload);
    const editSongPayload = {
      ...request.payload,
      ...request.params,
    };

    await this._service.editSong(editSongPayload);
    return reply.response(successResponse(undefined, 'Data Song berhasil diperbarui'));
  }

  async deleteSongByIdHandler(request, reply) {
    const { id } = request.params;
    
    await this._service.getSongById(id);
    await this._service.deleteSongById(id);

    return reply.response(successResponse(undefined, 'Song berhasil dihapus'));
  }
}

module.exports = SongsHandler;
