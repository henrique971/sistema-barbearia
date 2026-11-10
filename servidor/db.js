const { DatabaseSync } = require('node:sqlite');
const config = require('./config');

let _db = null;

function getDb() {
  if (!_db) {
    _db = new DatabaseSync(config.DB_PATH);
    _db.exec('PRAGMA foreign_keys = ON');
    _db.exec('PRAGMA journal_mode = WAL');
  }
  return _db;
}

module.exports = { getDb };
