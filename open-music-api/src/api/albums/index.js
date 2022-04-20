const AlbumsHandler = require('./handler');
const albumRoutes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, storageService, validator }) => {
    const albumsHandler = new AlbumsHandler(service, storageService, validator);
    server.route(albumRoutes(albumsHandler));
  },
};
