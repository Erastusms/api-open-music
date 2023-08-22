const { successResponse } = require('../../response');
const { getConstUpdate, getConstDelete } = require('../../constant');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, reply) {
    this._validator.validatePostAuthenticationPayload(request.payload);
    const id = await this._usersService.verifyUserCredential({ ...request.payload });

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    await this._authenticationsService.addRefreshToken(refreshToken);

    const tokenData = { accessToken, refreshToken };
    const responseResult = reply.response(successResponse(tokenData, 'Success Login'));
    return responseResult.code(201);
  }

  async putAuthenticationHandler(request, reply) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    return reply.response(successResponse({ accessToken }, getConstUpdate('Authentication User')));
  }

  async deleteAuthenticationHandler(request, reply) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;
    
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return reply.response(successResponse(undefined, getConstDelete('Refresh token')));
  }
}

module.exports = AuthenticationsHandler;
