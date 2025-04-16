import * as eventhub from "@pulumi/azure-native/eventhub";
import * as network from "@pulumi/azure-native/network";
import * as pulumi from "@pulumi/pulumi";

import {resourcesGroup, projectName, location, env} from "./common";
import {subnetPrivate} from "./network";

interface eventHubConfig {
    maximumThroughputUnits: number,
    isAutoInflateEnabled: boolean,
    zoneRedundant: boolean,
    partitionCount: number,
    messageRetentionInDays: number,
}

const evhConfig = new pulumi.Config('eventHub').requireObject<eventHubConfig>('config')

const namespaceName = `evh-namespace-${env}`
const evhNamespace = new eventhub.Namespace(namespaceName, {
    resourceGroupName: resourcesGroup.name,
    location: location,
    minimumTlsVersion: eventhub.TlsVersion.TlsVersion_1_2,
    namespaceName: namespaceName,
    isAutoInflateEnabled: evhConfig.isAutoInflateEnabled,
    publicNetworkAccess: eventhub.PublicNetworkAccess.Disabled,
    maximumThroughputUnits: evhConfig.maximumThroughputUnits,
    sku: {
        name: `sku-${env}`,
        tier: "Standard"
    }
})

const evhName = `evh-${projectName}-${env}`
const eventHub = new eventhub.EventHub(evhName, {
    resourceGroupName: resourcesGroup.name,
    eventHubName: evhName,
    partitionCount: evhConfig.partitionCount,
    messageRetentionInDays: evhConfig.messageRetentionInDays,
    namespaceName: evhNamespace.name
})

const evhAuthzRuleName = `evh-auth-${projectName}-${env}`
const evhAuthzRules = new eventhub.EventHubAuthorizationRule(evhAuthzRuleName, {
    resourceGroupName: resourcesGroup.name,
    eventHubName: eventHub.name,
    namespaceName:evhNamespace.name,
    authorizationRuleName: evhAuthzRuleName,
    rights: [
        eventhub.AccessRights.Listen,
        eventhub.AccessRights.Send,
        eventhub.AccessRights.Manage,
    ]
})

const peName = `pe-as-${projectName}-${env}`
const privateEndpoint = new network.PrivateEndpoint(peName, {
    resourceGroupName: resourcesGroup.name,
    location: location,
    subnet: {
        id: subnetPrivate.id,
    },
    privateLinkServiceConnections: [
        {
            name: "evhPrivateLink",
            privateLinkServiceId: evhNamespace.id,
            groupIds: ["namespace"]
        }
    ]
})

const evhHubKeys = eventhub.listEventHubKeysOutput({
    resourceGroupName: resourcesGroup.name,
    authorizationRuleName: evhAuthzRules.name,
    eventHubName: eventHub.name,
    namespaceName: evhNamespace.name,
})

export const evhConnectionString = evhHubKeys.primaryConnectionString