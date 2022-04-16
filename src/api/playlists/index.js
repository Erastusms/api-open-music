const PlaylistsHandler = require('./handler');
const playlistsRoutes = require('./routes');

module.exports = {
  version: '1.0.0',
  name: 'playlists',
  register: async (server, { songsService, playlistsService, validator }) => {
    const playlistsHandler = new PlaylistsHandler(songsService, playlistsService, validator);
    server.route(playlistsRoutes(playlistsHandler));
  },
};
