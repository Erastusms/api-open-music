const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { isEmpty } = require('lodash');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel, mapAlbumDetail } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
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

  async getAlbumAndSongsById(albumId) {
    const queryParams = {
      text: 'SELECT albums.id, albums.name, albums.year, ',
      values: [albumId],
    };

    queryParams.text += 'json_agg(json_build_object(\'id\', songs.id, \'title\', ';
    queryParams.text += 'songs.title, \'performer\', songs.performer)) as songs ';
    queryParams.text += 'FROM albums JOIN songs ON albums.id = songs.album_id ';
    queryParams.text += 'WHERE albums.id = $1 GROUP BY 1, 2, 3';

    const resultAlbums = await this._pool.query(queryParams);
    if (isEmpty(resultAlbums.rows)) return this.getAlbumById(albumId);

    return resultAlbums.rows.map(mapDBToModel)[0];
  }

  async getAlbumById(albumId) {
    const queryParamsAlbums = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const albumsResult = await this._pool.query(queryParamsAlbums);
    if (isEmpty(albumsResult.rows)) throw new NotFoundError('Album Id');

    return albumsResult.rows.map(mapAlbumDetail)[0];
  }

  async editAlbum(payload) {
    const { name, year, albumId } = payload;
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, albumId],
    };

    const result = await this._pool.query(query);
    if (isEmpty(result.rows)) throw new NotFoundError('Album Id');
  }

  async deleteAlbumById(albumId) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [albumId],
    };

    await this._pool.query(query);
  }

  async addFileUpload(payload) {
    const { albumId, fileLocation } = payload;
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [fileLocation, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) throw new InvariantError('Cover Album gagal diupload');
    return result.rows[0].id;
  }

  async getOldCoverAlbum(albumId) {
    const queryParamsAlbums = {
      text: 'SELECT cover_url FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(queryParamsAlbums);
    if (isEmpty(result.rows)) return false;
    return result.rows[0].cover_url;
  }

  async checkIsAlbumLikes(payload) {
    const { albumId, userId } = payload;
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (isEmpty(result.rows)) return false;
    return true;
  }

  async likeAlbum(payload) {
    const { albumId, userId } = payload;
    const likesId = `likes-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [likesId, userId, albumId],
    };

    await this._cacheService.delete(`totalLikes-${albumId}`);
    await this._pool.query(query);
  }

  async dislikeAlbum(payload) {
    const { albumId, userId } = payload;
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    await this._cacheService.delete(`totalLikes-${albumId}`);
    await this._pool.query(query);
  }

  async getTotalLikesAlbum(albumId) {
    let result = await this._cacheService.get(`totalLikes-${albumId}`);
    if (!result) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      result = await this._pool.query(query);
      await this._cacheService.set(`totalLikes-${albumId}`, result.rowCount.toString());
      return {
        isCache: false,
        likes: result.rowCount
      };
    }
    return {
      isCache: true,
      likes: +result
    };
  }
}

module.exports = AlbumsService;
