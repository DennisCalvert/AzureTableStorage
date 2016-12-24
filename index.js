const config = require(process.cwd() + '/config');
const azure = require('azure-storage');
const Promise = require("bluebird");
const atsTranslator = require('./atsTranslator');

function AzureTableStorage() {

	const retryOperations = new azure.ExponentialRetryPolicyFilter();
	const tableSvc = azure.createTableService(config.azureStorage.table.accountName, config.azureStorage.table.accountKey).withFilter(retryOperations);


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
							const r = { RowKey: tableStorageObj.RowKey._ };
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