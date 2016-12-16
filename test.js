const ats = require('./index');
const uuid = require('uuid');
const config = require('godconfig');

const tableName = config.azureStorage.table.tables.gotit;

const mockData = {
    partitionkey: 'userdwc',
    name: 'Toast',
    description: 'made from cheap bread'
};

console.log('starting');

// let i = 50;
// while(i--){
//  ats.post(tableName, mockData.partitionkey, mockData).then(console.log).catch(console.log);   
// }

//ats.post(tableName, mockData.partitionkey, mockData).then(console.log).catch(console.log);

ats.get(tableName, 'userdwc').then(console.log).catch(console.log);

//ats.deleteTable(tableName).then(console.log);