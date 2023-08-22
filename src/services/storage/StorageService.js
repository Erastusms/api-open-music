/* eslint-disable class-methods-use-this */
const fs = require('fs');
const path = require('path');
const { arrFileExt } = require('../../constant');
const InvariantError = require('../../exceptions/InvariantError');

class StorageService {
  validateFile(file) {
    if (!file.hapi) throw new InvariantError('Payload must be a file');
    if (file.hapi.filename === '') throw new InvariantError('File cant be empty');

    const contentType = Object.values(file.hapi.headers)[1];
    const isContentTypeValid = arrFileExt.some((validExt) => validExt === contentType);

    if (!isContentTypeValid) throw new InvariantError('Invalid file extension uploaded');
    return file;
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const folderUpload = path.resolve(__dirname, '../../../assets/uploads');
    const pathUploaded = `${folderUpload}/${filename}`;

    const fileStream = fs.createWriteStream(pathUploaded);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageService;
