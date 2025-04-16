import * as pulumi from "@pulumi/pulumi";
import * as storage from "@pulumi/azure-native/storage";

import {resourcesGroup, env, projectName, location, tags} from './common'


interface StorageAccountParams {
    sku: string,
    kind: string
}
export const storageAccountParams = new pulumi.Config('storageAccount').requireObject<StorageAccountParams>('params')

const regEx = /-/gs
const saName = `sa-${projectName}-${env}`
let storageAccountName = saName.replace(regEx, '')

if (storageAccountName.length > 24) {
    const nbr = storageAccountName.length - 24
    storageAccountName = storageAccountName.substring(0, storageAccountName.length - nbr).substring(0, 24)
}

export const storageAccount = new storage.StorageAccount(storageAccountName, {
    accountName: storageAccountName,
    resourceGroupName: resourcesGroup.name,
    location: location,
    sku: {
        name: storageAccountParams.sku,
    },
    kind: storageAccountParams.kind,
    allowBlobPublicAccess: false,
    enableHttpsTrafficOnly: false, //True for prod env
    networkRuleSet: {
        defaultAction: 'Deny',
        bypass: 'Logging, Metrics, AzureServices',
        ipRules: [{
            iPAddressOrRange: "0.0.0.0/0" // IP List autoriser to access to the blob
        }], 
    },
    tags: tags
})

new storage.BlobServiceProperties('blobService', {
    accountName: storageAccount.name,
    blobServicesName: "default",
    resourceGroupName: resourcesGroup.name,
    deleteRetentionPolicy: {
        enabled: true,
        days: 7,
        allowPermanentDelete: true  // false for critical contents
    },
    isVersioningEnabled: true
})

const saContainerName = `sa-cn-${projectName}-${env}`
export const blobContainer = new storage.BlobContainer(saContainerName, {
    resourceGroupName: resourcesGroup.name,
    accountName: storageAccount.name,
    containerName: saContainerName,
    publicAccess: 'None'
})

const storageAccountKeys = storage.listStorageAccountKeysOutput({
    resourceGroupName: resourcesGroup.name,
    accountName: storageAccount.name
})

export const primaryStorageKey = storageAccountKeys.keys[0].value