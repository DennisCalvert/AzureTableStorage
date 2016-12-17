var config = require('godconfig');
var azure = require('azure-storage');
var Promise = require("bluebird");
var atsTranslator = require('./atsTranslator');

function AzureTableStorage() {

	var retryOperations = new azure.ExponentialRetryPolicyFilter();
	var tableSvc = azure.createTableService(config.azureStorage.table.accountName, config.azureStorage.table.accountKey).withFilter(retryOperations);


	// Public Methods
	return {

		get: function (tableName, partitionKey) {
			const query = new azure.TableQuery().where('PartitionKey eq ?', partitionKey);

			return new Promise(function(resolve) {
                tableSvc.queryEntities(tableName, query, null, function (error, result, response) {
                    resolve(atsTranslator.out(result));
                });
	        });
		},


		post: function (tableName, partitionKey, dataObj) {
			const tableStorageObj = atsTranslator.in(dataObj, partitionKey);

			return new Promise(function(resolve, reject){
				tableSvc.createTableIfNotExists(tableName, function (error, result, response) {
					tableSvc.insertOrMergeEntity(tableName, tableStorageObj, { echoContent: true }, function (error, result, response) {
						if (!error) {
							var r = { RowKey: tableStorageObj.RowKey._ };
							resolve(r);
						} else {
							reject(error);
						}
					});
				});
			});
		},


		delete: function (tableName, partitionKey, rowKey) {
			const task = {
				PartitionKey: { '_': partitionKey },
				RowKey: { '_': rowKey }
			};

			return new Promise(function(resolve){
				tableSvc.deleteEntity(tableName, task, function (error, response) {
					if (!error) {
						resolve(response);
					}
				});
			});
		},


        deleteTable: function (tableName) {
            return new Promise(function(resolve, reject){
                tableSvc.deleteTableIfExists(tableName, function(error, response){
                    if(!error){
                        resolve(response);
                    } else {
                        reject(error);
                    }
                })
            })            
        }
	}
}

module.exports = AzureTableStorage();