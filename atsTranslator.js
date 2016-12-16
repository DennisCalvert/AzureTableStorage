var uuid = require('uuid');
var azure = require('azure-storage');

// Prepare Data Objects for Azure Table Storage
function applyAzureProperties(obj, PartitionKey) {
    var entGen = azure.TableUtilities.entityGenerator;
    var azureObj = {};

    for (var p in obj) {
        // Bail if null
        if (obj[p] === null) {
            continue;
        }

        // IS BOOL?
        if (typeof (obj[p]) == "boolean") {
            azureObj[p] = entGen.Boolean(obj[p]);

        // IS GUID?
        } else if (obj[p].length === 36 && obj[p].split("-").length === 5) {
            azureObj[p] = entGen.Guid(obj[p]);

        // IS OBJECT OR ARRAY?
        } else if (typeof (obj[p]) === 'object') {
            azureObj[p] = entGen.String(JSON.stringify(obj[p]));

         // JUST DEAL WITH IT
        } else {
            azureObj[p] = entGen.String(obj[p].toString());
        }
    }
    azureObj.PartitionKey = entGen.String(PartitionKey);
    azureObj.RowKey = (obj.RowKey) ? entGen.String(obj.RowKey) : entGen.String(uuid.v4());

    return azureObj;
}


// Remove Azure Table Storage Properties for Public Consumption
function convertObjectForAzure(azureEntities) {
    var formattedArray = [];

    if (!azureEntities) {
        return formattedArray;
    }

    function deEntify(entity) {
        var obj = {};
        for (var propertyName in entity) {
            if (entity[propertyName] && ["PartitionKey", ".metadata"].indexOf(propertyName) === -1) {
                obj[propertyName] = entity[propertyName]._;
            }
        }
        formattedArray.push(obj);
    }

    if (Array.isArray(azureEntities.entries)) {
        azureEntities.entries.forEach(deEntify);
        return formattedArray;
    } else {
        deEntify(azureEntities);
        return formattedArray[0];
    }
}

const publicMethods = {
    in: applyAzureProperties,
    out: convertObjectForAzure
};

module.exports = publicMethods;