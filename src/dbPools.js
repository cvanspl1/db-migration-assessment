const { Pool } = require('pg');

let ORIGINAL_URI = 'postgresql://old:hehehe@localhost:5432/old';
let MIGRATED_URI = 'postgresql://new:hahaha@localhost:5433/new';

// create a new pool for each DB using the connection strings above
const originalPool = new Pool({
  connectionString: ORIGINAL_URI,
});
const migratedPool = new Pool({
  connectionString: MIGRATED_URI,
});

module.exports = {
  queryOriginal: (text, params, callback) => originalPool.query(text, params, callback),
  queryMigrated: (text, params, callback) => migratedPool.query(text, params, callback),
};
