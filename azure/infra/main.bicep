targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment for tagging and resource naming')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Resource group name')
param resourceGroupName string = 'rg-${environmentName}'

@description('PostgreSQL administrator login name')
param postgresAdminLogin string = 'hivecraftadmin'

@secure()
@description('PostgreSQL administrator password')
param postgresAdminPassword string

@secure()
@description('Session secret for Express session management')
param sessionSecret string

@description('Replit OAuth Client ID')
param replitClientId string = ''

@secure()
@description('Replit OAuth Client Secret')
param replitClientSecret string = ''

// Resource token for unique naming
var resourceToken = uniqueString(subscription().id, location, environmentName)
var abbrs = {
  containerRegistry: 'acr'
  containerApp: 'ca'
  containerAppEnvironment: 'cae'
  logAnalytics: 'log'
  managedIdentity: 'id'
  postgreSQLServer: 'psql'
  storageAccount: 'st'
}

// Create resource group
resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Deploy resources into the resource group
module resources './resources.bicep' = {
  scope: rg
  params: {
    environmentName: environmentName
    location: location
    resourceToken: resourceToken
    abbrs: abbrs
    postgresAdminLogin: postgresAdminLogin
    postgresAdminPassword: postgresAdminPassword
    sessionSecret: sessionSecret
    replitClientId: replitClientId
    replitClientSecret: replitClientSecret
  }
}

output RESOURCE_GROUP_ID string = rg.id
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = resources.outputs.AZURE_CONTAINER_REGISTRY_ENDPOINT
output AZURE_CONTAINER_APP_ENDPOINT string = resources.outputs.AZURE_CONTAINER_APP_ENDPOINT
output POSTGRES_HOST string = resources.outputs.POSTGRES_HOST
output POSTGRES_DATABASE string = resources.outputs.POSTGRES_DATABASE
