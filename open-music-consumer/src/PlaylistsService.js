const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name FROM playlists WHERE playlists.id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows) {
      throw 'Gagal mengambil nama playlist';
    }
    return result.rows[0];
  }
}

module.exports = PlaylistsService;
