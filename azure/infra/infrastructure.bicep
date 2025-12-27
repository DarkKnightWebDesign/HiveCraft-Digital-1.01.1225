param location string = 'eastus'
param environment string = 'dev'
param projectName string = 'hivecraft'

// Resource Group is assumed to already exist

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: '${projectName}-sql-${environment}'
  location: location
  properties: {
    administratorLogin: 'hivecraftadmin'
    administratorLoginPassword: 'REPLACE_WITH_SECURE_PASSWORD'
    version: '12.0'
  }
}

// SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: '${projectName}-db-${environment}'
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: '${projectName}storage${environment}'
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
  name: '${projectName}-plan-${environment}'
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
}

resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: '${projectName}-api-${environment}'
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
      ]
    }
  }
}
