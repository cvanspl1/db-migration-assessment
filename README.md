# Database Migration Assessment

This repository contains code for generating a report of inconsistencies between two versions of a database.

# Scenario

Imagine that your team recently performed a data migration from one database to another. 
One week after the migration it was discovered that there was a bug in the migration process and some records were unintentionally missed or altered!
This program is designed to identify the missing, corrupted, and new records (since the migration) in the migrated data set.

# Setup & Running Code

- [ ] Ensure Docker is installed on your local machine and the Docker daemon is running (`systemctl start docker`)
- [ ] In a terminal enter the following command to spin up a Docker image containing a snapshot of the pre-migration database: 
```
sudo docker run -p 5432:5432 guaranteedrate/homework-pre-migration:1607545060-a7085621
```
- [ ] In another terminal window enter the following command to spin up a Docker image containing a snapshot of the post-migration database:
```
sudo docker run -p 5433:5432 guaranteedrate/homework-post-migration:1607545060-a7085621
```
- [ ] Use a third terminal window to clone this repository (`git clone https://github.com/cvanspl1/db-migration-assessment.git`) and navigate to its top-level directory
- [ ] Run `npm install` to install all required node modules
- [ ] Run `npm start` to execute the code in development mode

# Program Output

Upon succesful execution of the code, a `report.csv` file will be generated in the top level directory of your local repo. The report includes the following columns:

- `pre_migration_id`: The ID of the account record in the pre-migration database (if it exists in the pre-migration database)	post_migration_id
- `post_migration_id`: The ID of the account record in the post-migration database (if it exists in the post-migration database)
- `name_corrupted`: A 'true' in this column indicates that the name field was corrupted during migration for the specified account ID.
- `email_corrupted`: A 'true' in this column indicates that the email field was corrupted during migration for the specified account ID.	
- `added_after_migration`: A 'true' in this column indicates that the record was added after the migration was complete (does not exist in pre-migration database)
- `lost_during_migration`: A 'true' in this column indicates that the record was lost during migration (does not exist in post-migration database)

The report should be opened with Microsoft Excel, Google Sheets, or some other spreadsheet application. Each column can be filtered for 'T' so that action can be taken to correct all corrupted data in the post-migration database.

# Testing the Code

Several test cases were written to ensure that the code is working as expected.

- [ ] Run `npm test` to execute the existing test cases (All test cases can be found in  `./__tests__/index.js`)

The code is run using two simple test databases. The generated report is then compared to the contents of `./__tests__/expected.csv`, which contains the expected results for a succesful migration analysis of the test databases. The results of each test case will be logged to the console.


# Databases & Environment variables

A second set of databases has been created for testing purposes. The database URIs are set in `./src/models/models.js` based on the NODE_ENV environment variable and the URIs stored in the `.env` file. Executing the `npm test` command will set the NODE_ENV environment variable to `test`, which will trigger the selection of the test databases. Executing the `npm start` command will set the NODE_ENV environment variable to `development`, which will trigger the selection of the provided Docker databases. 

# Solution Explanation

I chose to implement my solution in what seemed to me like the most straight-forward approach. Rather than waste time writing logic to compare the two databases, I chose to copy the accounts table from the pre-migration database into the post-migration database. This simplified the logic of generating the report down to a single SQL query. Once the comparison is complete, the newly created table is then dropped from the post-migration database (which is not strictly necessary since we are working off of a Docker image). The main downside to my current implementation is that I am inserting each record from the pre-migration database into the post-migration database one-by-one, each with its own INSERT statement. This makes the code to create the new table extremely inefficient. In a realistic scenario I would refactor to ensure that these entries are added in as few queries as possible, but the prompt said that I should not spend a significant amount of time optimizing an already working solution. This approach only works because the number of entries in the pre-migration database was fairly small (~80k). The approach would have to be modified in situations where the size of the table's contents is larger than the available memory of the machine.