/* eslint-disable camelcase */
const mapDBToModel = ({ album_id, ...args }) => ({
  ...args,
  albumId: album_id,
});

const mapAlbumDetail = ({ cover_url, ...args }) => ({
  ...args,
  coverUrl: cover_url,
});

module.exports = { mapDBToModel, mapAlbumDetail };
