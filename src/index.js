const csv = require('fast-csv');
const ws = require('fs').createWriteStream('report.csv');
const db = require('./dbPools.js');

// Attempts to remove the old_accounts table from the new database
const dropOldAccountsTable = () => {
  console.log('Attempting to remove old_accounts table from new database...');
  db.queryMigrated('DROP TABLE IF EXISTS old_accounts')
    .then(() => {
      console.log('SUCCESS: old_accounts table removed from new database');
      console.log('EXECUTION COMPLETE - closing db connections...');
    })
    .catch((err) => {
      console.log('ERROR: Failed to remove old_accounts table from new database - ', err);
    });
};

// Attempts to create the error report - calls dropOldAccountsTable regardless of success status
const createReport = () => {
  console.log('Attempting to generate report...');
  db.queryMigrated(
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
      const jsonData = JSON.parse(JSON.stringify(res.rows));
      csv.write(jsonData, { headers: true })
        .on('finish', () => {
          console.log(`SUCCESS: Account data exported to report.csv`);
          dropOldAccountsTable();
        })
        .pipe(ws);
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
    console.log('SUCCESS: ALL original account data was copied into the old_accounts table');
    createReport();
  } else {
    db.queryMigrated('INSERT INTO old_accounts(id, name, email) VALUES($1, $2, $3)', [
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

// Attempts to create an old_accounts table in the new db - calls insertOldAccountRow if successful
const createOldAccountsTable = (rows) => {
  console.log('Attempting to create old_accounts table in new database...');
  db.queryMigrated('CREATE TABLE old_accounts(id TEXT, name TEXT, email TEXT)')
    .then(() => {
      console.log('SUCCESS: old_accounts table created in new database');
      console.log(
        'Attempting to copy original account data into the old_accounts table... (this may take a several minutes)'
      );
      insertOldAccountRow(rows);
    })
    .catch((err) => {
      console.log('ERROR: Failed to create old_accounts table in new database - ', err);
    });
};

// Attempts to retrieve all data from the original database - calls createOldAccountsTable if successful
const getAllOriginalAccounts = () => {
  console.log('Attempting to retrieve data from original accounts table...');
  db.queryOriginal('SELECT * FROM accounts')
    .then((res) => {
      console.log('SUCCESS: Data retrieved from original accounts table');
      createOldAccountsTable(res.rows);
    })
    .catch((err) => {
      console.log('ERROR: Failed to retrieve data from original accounts table - ', err);
    });
};

getAllOriginalAccounts();