param location string = 'eastus2'
param envName string = 'dev'
param projectName string = 'hivecraft'

@secure()
param sqlAdminPassword string

param prefix string = 'hivecraft'

var suffix = toLower(uniqueString(resourceGroup().id))
var storageName = '${take(prefix, 11)}${take(suffix, 13)}'

var shortSuffix = take(suffix, 6)
var functionAppName = '${projectName}-api-${envName}-${shortSuffix}'
var functionPlanName = '${projectName}-plan-${envName}-${shortSuffix}'


// Resource Group is assumed to already exist

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: '${projectName}-sql-${envName}'
  location: location
  properties: {
    administratorLogin: 'hivecraftadmin'
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
  }
}

// SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: '${projectName}-db-${envName}'
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
  }
}

// Azure Function App (Consumption)
resource functionPlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: functionPlanName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
}

resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: functionPlan.id
    siteConfig: {
      appSettings: [
  {
    name: 'FUNCTIONS_WORKER_RUNTIME'
    value: 'node'
  }
  {
    name: 'FUNCTIONS_EXTENSION_VERSION'
    value: '~4'
  }
  {
  name: 'AzureWebJobsStorage'
  value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, storageAccount.apiVersion).keys[0].value};EndpointSuffix=core.windows.net'
}
  {
    name: 'WEBSITE_RUN_FROM_PACKAGE'
    value: '1'
  }
]

    }
  }
}

