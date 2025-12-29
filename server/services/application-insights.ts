import * as appInsights from 'applicationinsights';

let isInitialized = false;

/**
 * Initialize Application Insights for monitoring and analytics
 */
export function initializeApplicationInsights(): void {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.warn('Application Insights not configured. Set APPLICATIONINSIGHTS_CONNECTION_STRING in .env');
    return;
  }

  if (isInitialized) {
    return;
  }

  // Setup Application Insights
  appInsights.setup(connectionString)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();

  // Configure cloud role
  appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'hivecraft-api';

  isInitialized = true;
  console.log('Application Insights initialized');
}

/**
 * Get Application Insights client
 */
export function getInsightsClient() {
  return appInsights.defaultClient;
}

/**
 * Track custom event
 */
export function trackEvent(name: string, properties?: { [key: string]: string | number | boolean }): void {
  if (!isInitialized) return;

  appInsights.defaultClient.trackEvent({
    name,
    properties,
  });
}

/**
 * Track custom metric
 */
export function trackMetric(name: string, value: number, properties?: { [key: string]: string }): void {
  if (!isInitialized) return;

  appInsights.defaultClient.trackMetric({
    name,
    value,
    properties,
  });
}

/**
 * Track user action
 */
export function trackUserAction(userId: string, action: string, properties?: Record<string, any>): void {
  trackEvent('UserAction', {
    userId,
    action,
    ...properties,
  });
}

/**
 * Track project activity
 */
export function trackProjectActivity(
  projectId: string,
  activityType: string,
  userId: string,
  metadata?: Record<string, any>
): void {
  trackEvent('ProjectActivity', {
    projectId,
    activityType,
    userId,
    ...metadata,
  });
}

/**
 * Track API performance
 */
export function trackAPIPerformance(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number
): void {
  trackMetric('APIResponseTime', duration, {
    endpoint,
    method,
    statusCode: statusCode.toString(),
  });
}

/**
 * Track file upload
 */
export function trackFileUpload(
  projectId: string,
  userId: string,
  fileSize: number,
  fileType: string
): void {
  trackEvent('FileUpload', {
    projectId,
    userId,
    fileSize: fileSize.toString(),
    fileType,
  });

  trackMetric('FileUploadSize', fileSize, {
    projectId,
    fileType,
  });
}

/**
 * Track authentication
 */
export function trackAuthentication(
  method: 'email' | 'google' | 'facebook' | 'github',
  success: boolean,
  userId?: string
): void {
  trackEvent('Authentication', {
    method,
    success: success.toString(),
    userId: userId || 'anonymous',
  });
}

/**
 * Track error with context
 */
export function trackError(error: Error, context?: Record<string, any>): void {
  if (!isInitialized) return;

  appInsights.defaultClient.trackException({
    exception: error,
    properties: context,
  });
}

/**
 * Check if Application Insights is configured
 */
export function isApplicationInsightsConfigured(): boolean {
  return isInitialized;
}
