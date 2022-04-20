module.exports = {
  ACTION: {
    ADD: 'add',
    DELETE: 'delete'
  },
  MIN_YEAR: 1900,
  CURRENT_YEAR: new Date().getFullYear(),
  MAX_LENGTH_STRING: 50,
  arrFileExt: ['image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'],
  getConstAdd: (key) => `${key} berhasil ditambahkan`,
  getConstUpdate: (key) => `${key} berhasil diperbarui`,
  getConstDelete: (key) => `${key} berhasil dihapus`,
};
