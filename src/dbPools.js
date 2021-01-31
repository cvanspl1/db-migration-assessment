const { Pool } = require('pg');
require('dotenv').config();

let ORIGINAL_URI = '';
let MIGRATED_URI = '';

// Use seperate databases for development and test mode
if (process.env.NODE_ENV === 'test') {
  console.log('TEST MODE');
  ORIGINAL_URI = process.env.ORIGINAL_URI_TEST;
  MIGRATED_URI = process.env.MIGRATED_URI_TEST;
} else {
  console.log('DEVELOPMENT MODE');
  ORIGINAL_URI = process.env.ORIGINAL_URI_DEV;
  MIGRATED_URI = process.env.MIGRATED_URI_DEV;
}

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
