const ClientError = require('./ClientError');

class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthenticationError';
    this.message = 'Wrong Credential Id';
  }
}

module.exports = AuthenticationError;
