const fs = require('fs');
const path = require('path');
const { successResponse } = require('../../response');
const { getConstAdd, getConstUpdate, getConstDelete } = require('../../constant');

class AlbumsHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;

    this.addAlbumHandler = this.addAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.editAlbumByIdHandler = this.editAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);

    this.addCoversAlbumHandler = this.addCoversAlbumHandler.bind(this);
    this.likesAlbumHandler = this.likesAlbumHandler.bind(this);
    this.getTotalLikesAlbumHandler = this.getTotalLikesAlbumHandler.bind(this);
  }

  async addAlbumHandler(request, reply) {
    this._validator.validateAlbumsPayload(request.payload);

    const albumId = await this._service.addAlbum(request.payload);
    const responseResult = reply.response(successResponse({ albumId }, getConstAdd('Album')));
    return responseResult.code(201);
  }

  async getAlbumByIdHandler(request, reply) {
    const { albumId } = request.params;
    const album = await this._service.getAlbumAndSongsById(albumId);
    return reply.response(successResponse({ album }));
  }

  async editAlbumByIdHandler(request, reply) {
    this._validator.validateAlbumsPayload(request.payload);
    const editAlbumPayload = {
      ...request.payload,
      ...request.params,
    };

    await this._service.editAlbum(editAlbumPayload);
    return reply.response(successResponse(undefined, getConstUpdate('Album')));
  }

  async deleteAlbumByIdHandler(request, reply) {
    const { albumId } = request.params;

    await this._service.getAlbumById(albumId);
    await this._service.deleteAlbumById(albumId);

    return reply.response(successResponse(undefined, getConstDelete('Album')));
  }

  async addCoversAlbumHandler(request, reply) {
    const { albumId } = request.params;
    const { cover } = request.payload;
    this._validator.validateUploadCover(request.payload);

    await this._service.getAlbumById(albumId);
    await this._storageService.validateFile(cover);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/assets/uploads/${filename}`;
    const getOldCoverUrl = await this._service.getOldCoverAlbum(albumId);
    const imageName = getOldCoverUrl.split('/')[5];
    
    if (getOldCoverUrl) await fs.promises.unlink(path.join(`assets/uploads/${imageName}`));
    
    await this._service.addFileUpload({ albumId, fileLocation });
    const responseResult = reply.response(successResponse({ fileLocation }, getConstAdd('Cover URL')));
    return responseResult.code(201);
  }

  async likesAlbumHandler(request, reply) {
    const { albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.getAlbumById(albumId);

    const isUserLikesAlbum = await this._service.checkIsAlbumLikes({ albumId, userId });
    if (isUserLikesAlbum) await this._service.dislikeAlbum({ albumId, userId });
    else await this._service.likeAlbum({ albumId, userId });

    const responseResult = reply.response(successResponse(undefined, getConstUpdate('Jumlah Likes')));
    return responseResult.code(201);
  }

  async getTotalLikesAlbumHandler(request, reply) {
    const { albumId } = request.params;
    const likesResponse = await this._service.getTotalLikesAlbum(albumId);
    const { isCache, likes } = likesResponse;
    const responseResult = reply.response(successResponse({ likes }));

    if (isCache) return responseResult.header('X-Data-Source', 'cache');
    return responseResult;
  }
}

module.exports = AlbumsHandler;
