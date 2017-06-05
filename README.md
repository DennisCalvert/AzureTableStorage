# Azure Table Storage Translator

This module handles translating JSON into a format which will help preserve data types in Azure table storage

## Configuartion
Add the following object to your config.js file

```azureStorage:{
    table: {
        accountName: xxxxx,
        accountKey: xxxxx
    }
}```

## Public Methods

```get: function (tableName, partitionKey) 

post: function (tableName, partitionKey, dataObj) 

delete: function (tableName, partitionKey, rowKey)

deleteTable: function (tableName)```