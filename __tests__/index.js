const reportTool = require('../src/index.js');
const fs = require('fs');
var path = require('path');
const csv = require('fast-csv');

const expectedData = [];
const actualData = [];

const checkLostDuringMigration = () => {
  let testCase = {
    testCase: 'TEST 5',
    description: 'The actual report accurately identifies records that were lost during the migration process.',
    status: true
  };
  for(let i = 0; i < actualData.length; i++) {
    if(actualData[i].lost_during_migration !== expectedData[i].lost_during_migration) testCase.status = false;
  }
  return testCase;
};

const checkAddedAfterMigration = () => {
  let testCase = {
    testCase: 'TEST 4',
    description: 'The actual report accurately identifies records that were added after the migration was complete.',
    status: true
  };
  for(let i = 0; i < actualData.length; i++) {
    if(actualData[i].added_after_migration !== expectedData[i].added_after_migration) testCase.status = false;
  }
  return testCase;
};

const checkEmailCorrupted = () => {
  let testCase = {
    testCase: 'TEST 3',
    description: 'The actual report accurately identifies records whose "email" field was corrupted during migration.',
    status: true
  };
  for(let i = 0; i < actualData.length; i++) {
    if(actualData[i].email_corrupted !== expectedData[i].email_corrupted) testCase.status = false;
  }
  return testCase;
};

const checkNameCorrupted = () => {
  let testCase = {
    testCase: 'TEST 2',
    description: 'The actual report accurately identifies records whose "name" field was corrupted during migration.',
    status: true
  };
  for(let i = 0; i < actualData.length; i++) {
    if(actualData[i].name_corrupted !== expectedData[i].name_corrupted) testCase.status = false;
  }
  return testCase;
};

const checkReportLengths = () => {
  let testCase = {
    testCase: 'TEST 1',
    description: 'The actual report contains all records from both databases.',
  };
  testCase.status = actualData.length === expectedData.length;
  return testCase;
};

const compareExpectedToActual = () => {
  const testCases = [];
  testCases.push(checkReportLengths());
  testCases.push(checkNameCorrupted());
  testCases.push(checkEmailCorrupted());
  testCases.push(checkAddedAfterMigration());
  testCases.push(checkLostDuringMigration());
  console.table(testCases);
};

const readActualData = () => {
  fs.createReadStream('report.csv')
    .pipe(csv.parse({ headers: true }))
    .on('data', row => actualData.push(row))
    .on('end', compareExpectedToActual);
};

const readExpectedData = () => {
  fs.createReadStream(path.join(__dirname, 'expected.csv'))
    .pipe(csv.parse({ headers: true }))
    .on('data', row => expectedData.push(row))
    .on('end', readActualData);
};

// A timeout of 2 seconds is added to give the code time to generate the report.
// This is obviously not a great solution to handling asynchronous code, 
// but I had limited free time to work on the assessment and this was the quickest way to set up tests.
setTimeout(readExpectedData, 2000);