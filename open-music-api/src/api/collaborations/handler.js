const { successResponse } = require('../../response');
const { getConstAdd, getConstDelete } = require('../../constant');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    this.addCollaborationHandler = this.addCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async addCollaborationHandler(request, reply) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;
    
    await this._playlistsService.findPlaylists(playlistId);
    await this._usersService.getUserById(userId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);
    const responseResult = reply.response(successResponse({ collaborationId }, getConstAdd('Collaborations')));
  
    return responseResult.code(201);
  }

  async deleteCollaborationHandler(request, reply) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.verifyCollaborator(playlistId, userId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);
  
    return reply.response(successResponse(undefined, getConstDelete('Collaborations')));
  }
}

module.exports = CollaborationsHandler;
