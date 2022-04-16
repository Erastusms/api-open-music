const { successResponse } = require('../../response/BaseResponse');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.addAlbumHandler = this.addAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.editAlbumByIdHandler = this.editAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async addAlbumHandler(request, reply) {
    this._validator.validateAlbumsPayload(request.payload);

    const albumId = await this._service.addAlbum(request.payload);
    const responseResult = reply.response(successResponse({ albumId }, 'Album berhasil ditambahkan'));
    return responseResult.code(201);
  }

  async getAlbumByIdHandler(request, reply) {
    const { id } = request.params;
    const album = await this._service.getAlbumAndSongsById(id);
    return reply.response(successResponse({ album }));
  }

  async editAlbumByIdHandler(request, reply) {
    this._validator.validateAlbumsPayload(request.payload);
    const editAlbumPayload = {
      ...request.payload,
      ...request.params,
    };

    await this._service.editAlbum(editAlbumPayload);
    return reply.response(successResponse(undefined, 'Data Album berhasil diperbarui'));
  }

  async deleteAlbumByIdHandler(request, reply) {
    const { id } = request.params;

    await this._service.getAlbumById(id);
    await this._service.deleteAlbumById(id);

    return reply.response(successResponse(undefined, 'Album berhasil dihapus'));
  }
}

module.exports = AlbumsHandler;
