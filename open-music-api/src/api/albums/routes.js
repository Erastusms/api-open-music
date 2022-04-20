const path = require('path');

const albumsRoutes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.addAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{albumId}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{albumId}',
    handler: handler.editAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{albumId}',
    handler: handler.deleteAlbumByIdHandler,
  },
  {
    method: 'POST',
    path: '/albums/{albumId}/covers',
    handler: handler.addCoversAlbumHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000,
      },
    },
  },
  {
    method: 'GET',
    path: '/assets/uploads/{params*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../../../assets/uploads'),
      },
    },
  },
  {
    method: 'POST',
    path: '/albums/{albumId}/likes',
    handler: handler.likesAlbumHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{albumId}/likes',
    handler: handler.getTotalLikesAlbumHandler,
  },
];

module.exports = albumsRoutes;
