const exportsRoutes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.exportPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = exportsRoutes;
