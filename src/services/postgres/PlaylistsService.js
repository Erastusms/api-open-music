const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { isEmpty } = require('lodash');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(payload) {
    const { userId, name } = payload;
    const playlistName = name.toLowerCase().split(' ').join('_');
    const playlistId = `playlist-${playlistName}`;
    const query = {
      text: 'INSERT INTO playlists(id, name, owner) VALUES($1, $2, $3) RETURNING id',
      values: [playlistId, name, userId],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new InvariantError('Playlist gagal ditambahkan');

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username 
             FROM playlists 
             JOIN users ON playlists.owner = users.id  
             LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
             WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new NotFoundError('Playlist Id');
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const playlistSongId = `playlist-song-${nanoid(8)}`;
    const query = {
      text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      values: [playlistSongId, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new InvariantError('Song gagal ditambahkan ke Playlist');

    return result.rows[0].id;
  }

  async getSongsFromPlaylistId(playlistId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username, ',
      values: [playlistId],
    };
    query.text += 'json_agg(json_build_object(\'id\', songs.id, \'title\', songs.title, \'performer\', songs.performer)) as songs ';
    query.text += 'FROM playlists JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id ';
    query.text += 'JOIN songs ON songs.id = playlist_songs.song_id JOIN users ON playlists.owner = users.id ';
    query.text += 'WHERE playlists.id = $1 GROUP BY 1, 2, 3';

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new NotFoundError(`Song from ${playlistId}`);
    
    return result.rows[0];
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

  async deleteSongFromPlaylist({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    await this._pool.query(query);
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
