const db = require('./dbPools.js');

// Attempts to remove the old_accounts table from the new database
const dropOldAccountsTable = () => {
  DB.queryMigrated('DROP TABLE IF EXISTS old_accounts')
    .then(() => {
      console.log('EXECUTION COMPLETE - closing DB connections...');
    })
    .catch((err) => {
      console.log('ERROR: Failed to remove old_accounts table from new database - ', err);
    });
};

// Attempts to create the error report - calls dropOldAccountsTable regardless of success status
const createReport = () => {
  DB.queryMigrated(
    `SELECT 
      old_accounts.id AS pre_migration_id,
      accounts.id AS post_migration_id, 
      (old_accounts.name <> accounts.name) AS name_corrupted,
      (old_accounts.email <> accounts.email) AS email_corrupted, 
      (old_accounts.id IS NULL) AS added_after_migration,
      (accounts.id IS NULL) AS lost_during_migration
    FROM accounts
    FULL JOIN old_accounts
      ON accounts.id = old_accounts.id`
  )
    .then((res) => {
      console.log(res.rows);
      dropOldAccountsTable();
    })
    .catch((err) => {
      console.log('ERROR: Unable to generate report - ', err);
      dropOldAccountsTable();
    });
};

// Recursively calls itelf until all rows are inserted into the new table, or an error occurs
// Calls createReport when all rows have been inserted, calls dropOldAccountsTable on error
const insertOldAccountRow = (rows, idx = 0) => {
  if (idx === rows.length) {
    createReport();
  } else {
    DB.queryMigrated('INSERT INTO old_accounts(id, name, email) VALUES($1, $2, $3)', [
      rows[idx].id,
      rows[idx].name,
      rows[idx].email,
    ])
      .then(() => {
        insertOldAccountRow(rows, idx + 1);
      })
      .catch((err) => {
        console.log(
          'ERROR: Unable to copy original account data into the old_accounts table - ',
          err
        );
        dropOldAccountsTable();
      });
  }
};

// Attempts to create an old_accounts table in the new DB - calls insertOldAccountRow if successful
const createOldAccountsTable = (rows) => {
  DB.queryMigrated('CREATE TABLE old_accounts(id TEXT, name TEXT, email TEXT)')
    .then(() => {
      insertOldAccountRow(rows);
    })
    .catch((err) => {
      console.log('ERROR: Failed to create old_accounts table in new database - ', err);
    });
};

// Attempts to retrieve all data from the original database - calls createOldAccountsTable if successful
const getAllOriginalAccounts = () => {
  DB.queryOriginal('SELECT * FROM accounts')
    .then((res) => {
      createOldAccountsTable(res.rows);
    })
    .catch((err) => {
      console.log('ERROR: Failed to retrieve data from original accounts table - ', err);
    });
};

getAllOriginalAccounts();