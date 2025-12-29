param location string = 'eastus2'
param envName string = 'dev'
param projectName string = 'hivecraft'

@secure()
param sqlAdminPassword string

param prefix string = 'hivecraft'

var suffix = toLower(uniqueString(resourceGroup().id))
var storageName = '${take(prefix, 11)}${take(suffix, 13)}'
var shortSuffix = take(suffix, 6)

// App Service for backend API
var appServiceName = '${projectName}-api-${envName}-${shortSuffix}'
var appServicePlanName = '${projectName}-plan-${envName}-${shortSuffix}'

// Static Web App for frontend
var staticWebAppName = '${projectName}-web-${envName}'

// Azure SQL Server
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: '${projectName}-sql-${envName}'
  location: location
  properties: {
    administratorLogin: 'hivecraftadmin'
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
  }
}

// Firewall rule for Azure services
resource sqlFirewallAzure 'Microsoft.Sql/servers/firewallRules@2022-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Azure SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: '${projectName}-db-${envName}'
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
}

// Storage Account for file uploads (Azure Blob)
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: true
  }
}

// Blob container for project files
resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  name: '${storageAccount.name}/default/hivecraft-files'
  properties: {
    publicAccess: 'Blob'
  }
}

// Application Insights for monitoring and analytics
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${projectName}-insights-${envName}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 90
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Log Analytics Workspace for Application Insights
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${projectName}-logs-${envName}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Azure Communication Services for email notifications
resource communicationService 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: '${projectName}-comms-${envName}'
  location: 'global'
  properties: {
    dataLocation: 'United States'
  }
}

// Email Communication Service
resource emailService 'Microsoft.Communication/emailServices@2023-04-01' = {
  name: '${projectName}-email-${envName}'
  location: 'global'
  properties: {
    dataLocation: 'United States'
  }
}

// Email Domain (AzureManagedDomain)
resource emailDomain 'Microsoft.Communication/emailServices/domains@2023-04-01' = {
  parent: emailService
  name: 'AzureManagedDomain'
  location: 'global'
  properties: {
    domainManagement: 'AzureManaged'
  }
}

// Link email domain to communication service
resource emailConnection 'Microsoft.Communication/communicationServices/domains@2023-04-01' = {
  parent: communicationService
  name: emailDomain.name
  location: 'global'
  properties: {
    domainManagement: 'AzureManaged'
  }
}

// SignalR Service for real-time messaging
resource signalRService 'Microsoft.SignalRService/signalR@2023-02-01' = {
  name: '${projectName}-signalr-${envName}'
  location: location
  sku: {
    name: 'Free_F1'
    tier: 'Free'
    capacity: 1
  }
  kind: 'SignalR'
  properties: {
    features: [
      {
        flag: 'ServiceMode'
        value: 'Default'
      }
    ]
    cors: {
      allowedOrigins: [
        'https://${staticWebAppName}.azurestaticapps.net'
        'http://localhost:3000'
      ]
    }
  }
}

// App Service Plan for backend API
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// App Service for backend API (Node.js/Express)
resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: appServiceName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'DATABASE_URL'
          value: 'postgresql://hivecraftadmin:${sqlAdminPassword}@${sqlServer.properties.fullyQualifiedDomainName}:5432/${sqlDatabase.name}?sslmode=require'
        }
        {
          name: 'SESSION_SECRET'
          value: uniqueString(resourceGroup().id, 'session-secret')
        }
        {
          name: 'AZURE_STORAGE_ACCOUNT_NAME'
          value: storageAccount.name
        }
        {
          name: 'AZURE_STORAGE_ACCOUNT_KEY'
          value: listKeys(storageAccount.id, storageAccount.apiVersion).keys[0].value
        }
        {
          name: 'AZURE_STORAGE_CONTAINER_NAME'
          value: 'hivecraft-files'
        }
        {
          name: 'BASE_URL'
          value: 'https://${appServiceName}.azurewebsites.net'
        }
        {
          name: 'FRONTEND_URL'
          value: 'https://${staticWebAppName}.azurestaticapps.net'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING'
          value: 'endpoint=https://${communicationService.name}.communication.azure.com/;accesskey=${listKeys(communicationService.id, communicationService.apiVersion).primaryKey}'
        }
        {
          name: 'AZURE_COMMUNICATION_EMAIL_SENDER'
          value: 'DoNotReply@${emailDomain.properties.mailFromSenderDomain}'
        }
        {
          name: 'AZURE_SIGNALR_CONNECTION_STRING'
          value: 'Endpoint=https://${signalRService.name}.service.signalr.net;AccessKey=${listKeys(signalRService.id, signalRService.apiVersion).primaryKey};Version=1.0;'
        }
      ]
    }
    httpsOnly: true
  }
}

// Azure Static Web App for frontend (React)
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: ''  // Will be set during deployment
    branch: 'main'
    buildProperties: {
      appLocation: 'client'
      apiLocation: ''  // API is separate App Service
      outputLocation: 'dist'
    }
  }
}

// Outputs for deployment
output apiUrl string = 'https://${appService.properties.defaultHostName}'
output webUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output databaseName string = sqlDatabase.name
output storageAccountName string = storageAccount.name
output staticWebAppName string = staticWebApp.name
output appServiceName string = appService.name
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output communicationServiceConnectionString string = 'endpoint=https://${communicationService.name}.communication.azure.com/;accesskey=${listKeys(communicationService.id, communicationService.apiVersion).primaryKey}'
output signalRConnectionString string = 'Endpoint=https://${signalRService.name}.service.signalr.net;AccessKey=${listKeys(signalRService.id, signalRService.apiVersion).primaryKey};Version=1.0;'
output emailSender string = 'DoNotReply@${emailDomain.properties.mailFromSenderDomain}'
