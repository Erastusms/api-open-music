exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INT',
      notNull: true,
    },
    cover_url: {
      type: 'TEXT',
      default: null
    }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
