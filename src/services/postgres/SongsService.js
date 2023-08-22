const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { isEmpty } = require('lodash');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong(payload) {
    const { duration = null, albumId = null, performer } = payload;
    const id = `${performer}-${nanoid(16)}`;
    const cleanPayload = payload;

    delete cleanPayload.duration;
    delete cleanPayload.albumId;

    const queryParams = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, ...Object.values(cleanPayload), duration, albumId],
    };

    const result = await this._pool.query(queryParams);
    if (!result.rows[0].id) throw new InvariantError('Song gagal ditambahkan');

    return result.rows[0].id;
  }

  async getSongs(query) {
    const { title, performer } = query;
    const queryParams = {
      text: 'SELECT id, title, performer FROM songs ',
    };

    if (title && performer) {
      queryParams.text += 'WHERE title ILIKE $1 AND performer ILIKE $2';
      queryParams.values = [`%${title}%`, `%${performer}%`];
    } else if (title) {
      queryParams.text += 'WHERE title ILIKE $1';
      queryParams.values = [`%${title}%`];
    } else if (performer) {
      queryParams.text += 'WHERE performer ILIKE $1';
      queryParams.values = [`%${performer}%`];
    }
    
    const result = await this._pool.query(queryParams);
    if (isEmpty(result.rows)) throw new NotFoundError('Song');
    return result.rows.map(mapDBToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new NotFoundError('Song Id');

    return result.rows.map(mapDBToModel)[0];
  }

  async editSong(payload) {
    const {
      id, title, year, performer, genre, duration,
    } = payload;

    const queryParams = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5 WHERE id = $6 RETURNING id',
      values: [title, year, performer, genre, duration, id],
    };

    const result = await this._pool.query(queryParams);
    if (isEmpty(result.rows)) throw new NotFoundError('Song Id');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = SongsService;
