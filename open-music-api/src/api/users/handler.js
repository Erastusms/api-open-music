const { successResponse } = require('../../response');
const { getConstAdd } = require('../../constant');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.addNewUserHandler = this.addNewUserHandler.bind(this);
  }

  async addNewUserHandler(request, reply) {
    this._validator.validateUserPayload(request.payload);
    
    const userId = await this._service.addNewUser({ ...request.payload });
    const responseResult = reply.response(successResponse({ userId }, getConstAdd('User')));

    return responseResult.code(201);
  }
}

module.exports = UsersHandler;
