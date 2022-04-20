const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { isEmpty } = require('lodash');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addPlaylist(payload) {
    const { userId, name } = payload;
    const playlistId = `playlist-${nanoid(8)}`;
    const query = {
      text: 'INSERT INTO playlists(id, name, owner) VALUES($1, $2, $3) RETURNING id',
      values: [playlistId, name, userId],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new InvariantError('Playlist gagal ditambahkan');

    await this._cacheService.delete(`cache-playlist-${userId}`);
    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    let result = await this._cacheService.get(`cache-playlist-${userId}`);
    if (!result) {
      const query = {
        text: `SELECT playlists.id, playlists.name, users.username 
               FROM playlists 
               JOIN users ON playlists.owner = users.id  
               LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
               WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
        values: [userId],
      };
      result = await this._pool.query(query);
      await this._cacheService.set(`cache-playlist-${userId}`, JSON.stringify(result.rows));
      return {
        isCache: false,
        result: result.rows
      };
    }
    return {
      isCache: true,
      result: JSON.parse(result)
    };
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id, owner',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new NotFoundError('Playlist Id');
    await this._cacheService.delete(`cache-playlist-${result.rows[0].owner}`);
  }

  async addSongToPlaylist({ playlistId, songId, userId }) {
    const playlistSongId = `playlist-song-${nanoid(8)}`;
    const query = {
      text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      values: [playlistSongId, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new InvariantError('Song gagal ditambahkan ke Playlist');

    await this._cacheService.delete(`cache-song-playlist-${userId}`);
    return result.rows[0].id;
  }

  async getSongsFromPlaylistId(playlistId, userId) {
    let result = await this._cacheService.get(`cache-song-playlist-${userId}`);
    if (!result) {
      const query = {
        text: 'SELECT playlists.id, playlists.name, users.username, ',
        values: [playlistId],
      };
      query.text += 'json_agg(json_build_object(\'id\', songs.id, \'title\', songs.title, \'performer\', songs.performer)) as songs ';
      query.text += 'FROM playlists JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id ';
      query.text += 'JOIN songs ON songs.id = playlist_songs.song_id JOIN users ON playlists.owner = users.id ';
      query.text += 'WHERE playlists.id = $1 GROUP BY 1, 2, 3';

      result = await this._pool.query(query);
      if (isEmpty(result.rows)) throw new NotFoundError(`Song from ${playlistId}`);
      await this._cacheService.set(`cache-song-playlist-${userId}`, JSON.stringify(result.rows[0]));
      return result.rows[0];
    }
    return JSON.parse(result);
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const query = {
      text: `SELECT playlists.id, playlists.owner
             FROM playlists
             INNER JOIN users ON playlists.owner = users.id  
             LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
             WHERE playlists.owner = $1 OR collaborations.user_id = $1
             AND playlists.id = $2`,
      values: [userId, playlistId],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new AuthorizationError('Playlist');
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (result.rows[0].owner !== userId) throw new AuthorizationError('Playlist');
  }

  async deleteSongFromPlaylist({ playlistId, songId, userId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (isEmpty(result.rows)) throw new NotFoundError(`Song from playlist: ${playlistId}`);
    await this._cacheService.delete(`cache-song-playlist-${userId}`);
  }

  async findPlaylists(playlistId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new NotFoundError('Playlist Id');
  }

  async getActivitiesPlaylists({ playlistId, userId }) {
    const query = {
      text: `SELECT users.username, songs.title, act.action, act.time
             FROM playlist_song_activities act
             JOIN users ON act.user_id = users.id
             JOIN songs ON act.song_id = songs.id
             WHERE playlist_id = $1 AND user_id = $2
             ORDER BY act.time ASC`,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new NotFoundError('Activities Playlist');
    return result.rows;
  }

  async addPlaylistActivities(activitiesPayload) {
    const { playlistId, songId, userId, action } = activitiesPayload;

    const activitiesId = `activities-${nanoid(8)}`;
    const query = {
      text: 'INSERT INTO playlist_song_activities(id, playlist_id, song_id, user_id, action) ',
      values: [activitiesId, playlistId, songId, userId, action],
    };

    query.text += 'VALUES($1, $2, $3, $4, $5) RETURNING id';
    const result = await this._pool.query(query);

    return result.rows[0].id;
  }
}

module.exports = PlaylistsService;
