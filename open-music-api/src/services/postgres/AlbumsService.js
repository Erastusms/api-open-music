const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { isEmpty } = require('lodash');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum(payload) {
    const { name, year } = payload;
    const id = `album-${year}-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) throw new InvariantError('Album gagal ditambahkan');
    return result.rows[0].id;
  }

  async getAlbumAndSongsById(id) {
    const queryParams = {
      text: 'SELECT albums.id, albums.name, albums.year, ',
      values: [id],
    };

    queryParams.text += 'json_agg(json_build_object(\'id\', songs.id, \'title\', ';
    queryParams.text += 'songs.title, \'performer\', songs.performer)) as songs ';
    queryParams.text += 'FROM albums JOIN songs ON albums.id = songs.album_id ';
    queryParams.text += 'WHERE albums.id = $1 GROUP BY 1, 2, 3';
    
    const resultAlbums = await this._pool.query(queryParams);
    if (isEmpty(resultAlbums.rows)) return this.getAlbumById(id);

    return resultAlbums.rows.map(mapDBToModel)[0];
  }

  async getAlbumById(id) {
    const queryParamsAlbums = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const albumsResult = await this._pool.query(queryParamsAlbums);
    if (isEmpty(albumsResult.rows)) throw new NotFoundError('Album Id');

    return albumsResult.rows.map(mapDBToModel)[0];
  }

  async editAlbum(payload) {
    const { name, year, id } = payload;
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new NotFoundError('Album Id');
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = AlbumsService;
