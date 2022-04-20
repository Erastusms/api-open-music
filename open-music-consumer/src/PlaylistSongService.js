const { Pool } = require('pg');

class PlaylistSongService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongsByPlaylistId(playlistId) {
    const query = {
      text: `
            SELECT songs.id, songs.title, songs.performer
            FROM playlist_songs
            INNER JOIN songs ON s.id = playlist_songs.song_id
            WHERE playlist_songs.playlist_id = $1
            `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistSongService;
