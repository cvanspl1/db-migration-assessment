const DB = require('./dbPools.js');

// Attempts to retrieve all data from the original database - calls createOldAccountsTable if successful
const getAllMigratedAccounts = () => {
  DB.queryMigrated('SELECT * FROM accounts')
    .then((res) => {
      console.log(res.rows);
    })
    .catch((err) => {
      console.log('ERROR: Failed to retrieve data from migrated accounts table - ', err);
    });
};

// Attempts to retrieve all data from the original database - calls createOldAccountsTable if successful
const getAllOriginalAccounts = () => {
  DB.queryOriginal('SELECT * FROM accounts')
    .then((res) => {
      console.log(res.rows);
    })
    .catch((err) => {
      console.log('ERROR: Failed to retrieve data from original accounts table - ', err);
    });
};

getAllOriginalAccounts();
getAllMigratedAccounts();