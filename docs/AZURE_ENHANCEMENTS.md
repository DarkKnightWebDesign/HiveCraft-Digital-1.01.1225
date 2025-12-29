# Azure Premium Enhancements

This document describes the premium enhancements added to HiveCraft Digital platform using Azure services.

## Features Overview

### 1. 🔄 Real-Time Messaging (Azure SignalR / Socket.IO)

**What it does:**
- Instant message delivery without page refresh
- Live project updates
- Typing indicators
- Real-time file upload notifications
- Live milestone status changes

**Technology:**
- **Local Development:** Socket.IO (WebSocket fallback to polling)
- **Production:** Azure SignalR Service (fully managed, auto-scaling)

**User Experience:**
- No need to refresh the page
- See messages appear instantly
- Know when team is typing
- Get immediate notifications

**Implementation:**
```typescript
// Client-side usage
import { useSocket } from '@/hooks/use-socket';

function ProjectMessages() {
  const { isConnected, on, joinProject } = useSocket();

  useEffect(() => {
    joinProject(projectId);

    on('new-message', (data) => {
      // Add message to UI instantly
      addMessage(data.message);
    });
  }, [projectId]);
}
```

**Server-side usage:**
```typescript
import { notifyNewMessage } from './services/signalr-hub';

// Send real-time notification
notifyNewMessage(projectId, message);
```

---

### 2. 📧 Email Notifications (Azure Communication Services)

**What it does:**
- Welcome emails for new users
- Project status update notifications
- New message alerts
- Milestone completion emails
- File upload notifications

**Technology:**
- Azure Communication Services Email
- HTML email templates
- Deliverability tracking
- Bounce management

**Email Types:**

1. **Welcome Email**
   - Sent when user first signs up
   - Introduces platform features
   - Links to client portal

2. **Project Update**
   - Milestone progress
   - Status changes
   - Admin comments

3. **Message Notification**
   - New message from admin/client
   - Message preview
   - Direct link to conversation

**Implementation:**
```typescript
import { sendWelcomeEmail } from './services/email-service';

// Send welcome email
await sendWelcomeEmail(user.email, user.name);
```

**Templates:**
- Professional branding
- Mobile-responsive
- Plain text fallback
- Branded colors (HiveCraft orange)

---

### 3. 📊 Application Insights (Monitoring & Analytics)

**What it does:**
- Real-time performance monitoring
- Error tracking and alerting
- User behavior analytics
- API performance metrics
- Custom event tracking

**Metrics Tracked:**

**Performance:**
- API response times
- Database query performance
- File upload speeds
- Page load times

**Usage:**
- Active users
- Project activity
- Feature usage
- User flows

**Errors:**
- Exception tracking
- Failed requests
- Database errors
- Authentication failures

**Custom Events:**
```typescript
import { trackProjectActivity, trackFileUpload } from './services/application-insights';

// Track project activity
trackProjectActivity(projectId, 'milestone_completed', userId);

// Track file upload
trackFileUpload(projectId, userId, fileSize, fileType);
```

**Dashboards:**
- Live metrics stream
- Performance overview
- Error rate trends
- User engagement

---

### 4. 🌐 Custom Domain Support

**What it does:**
- Professional branding (app.yourdomain.com)
- Automatic SSL certificates
- Custom email sender domain
- SEO benefits

**Setup:**
1. Configure DNS CNAME record
2. Add domain to Static Web App
3. Azure provisions SSL automatically
4. Update OAuth redirect URIs

**Benefits:**
- Professional appearance
- Brand trust
- Better email deliverability
- SEO optimization

---

## Architecture

### System Architecture
```
┌─────────────────┐
│   Client App    │
│   (React SPA)   │
│  Static Web App │
└────────┬────────┘
         │
         ├──────────┐
         │          │
         ▼          ▼
┌─────────────┐  ┌──────────────┐
│  App Service│  │   SignalR    │
│   (API)     │  │   Service    │
│  Express.js │  │ (WebSockets) │
└──────┬──────┘  └──────────────┘
       │
       ├──────┬──────┬──────────┐
       │      │      │          │
       ▼      ▼      ▼          ▼
  ┌────────┐ ┌────┐ ┌─────┐ ┌──────────┐
  │ Azure  │ │Blob│ │ SQL │ │   Comm   │
  │Insights│ │    │ │     │ │ Services │
  └────────┘ └────┘ └─────┘ └──────────┘
```

### Data Flow

**Real-Time Message:**
```
User A sends message
  ↓
Express API receives
  ↓
Save to database
  ↓
Socket.IO broadcasts
  ↓
User B receives instantly
```

**Email Notification:**
```
Project status changes
  ↓
Trigger email service
  ↓
Azure Communication Services
  ↓
Email delivered to client
```

**Analytics:**
```
User action occurs
  ↓
Track event in code
  ↓
Application Insights ingests
  ↓
Dashboard updates in real-time
```

---

## Configuration

### Environment Variables

```bash
# Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...

# Email Service
AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING=endpoint=https://...
AZURE_COMMUNICATION_EMAIL_SENDER=DoNotReply@yourdomain.com

# SignalR (optional for Azure SignalR)
AZURE_SIGNALR_CONNECTION_STRING=Endpoint=https://...

# OAuth (update redirect URIs for custom domain)
GOOGLE_CLIENT_ID=...
FACEBOOK_CLIENT_ID=...
```

### Client Configuration

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:5000'
    ),
  },
});
```

---

## Usage Examples

### Real-Time Messaging

**Join Project Room:**
```typescript
const { joinProject, on } = useSocket();

useEffect(() => {
  joinProject(projectId);

  on('new-message', handleNewMessage);
  on('project-updated', handleProjectUpdate);
  on('file-uploaded', handleFileUpload);
}, [projectId]);
```

**Send Typing Indicator:**
```typescript
const { sendTyping, stopTyping } = useSocket();

const handleInputChange = (e) => {
  setMessage(e.target.value);
  sendTyping(projectId, userName);

  // Stop typing after 2 seconds of inactivity
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    stopTyping(projectId);
  }, 2000);
};
```

### Email Notifications

**Send Welcome Email:**
```typescript
import { sendWelcomeEmail } from '@/services/email-service';

router.post('/api/auth/signup', async (req, res) => {
  const user = await createUser(req.body);

  // Send welcome email
  await sendWelcomeEmail(user.email, user.name);

  res.json(user);
});
```

**Project Update Email:**
```typescript
import { sendProjectUpdateEmail } from '@/services/email-service';

router.patch('/api/projects/:id', async (req, res) => {
  const project = await updateProject(req.params.id, req.body);

  // Notify client
  await sendProjectUpdateEmail(
    project.clientEmail,
    project.clientName,
    project.title,
    'Your project has been updated!'
  );

  res.json(project);
});
```

### Analytics Tracking

**Track User Actions:**
```typescript
import { trackUserAction } from '@/services/application-insights';

const handleLogin = async (method) => {
  await login(method);

  trackUserAction(userId, 'login', {
    method,
    timestamp: new Date().toISOString(),
  });
};
```

**Track API Performance:**
```typescript
import { trackAPIPerformance } from '@/services/application-insights';

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    trackAPIPerformance(req.path, req.method, duration, res.statusCode);
  });

  next();
});
```

---

## Performance Optimization

### SignalR Connection Pooling
- Reuse socket connections
- Automatic reconnection on disconnect
- Fallback from WebSocket to polling

### Email Batching
- Queue emails for batch sending
- Retry failed deliveries
- Track delivery status

### Application Insights Sampling
```typescript
// Reduce telemetry volume in production
appInsights.setup(connectionString)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setSendLiveMetrics(true)
  .start();

// Configure sampling
appInsights.defaultClient.config.samplingPercentage = 50; // Sample 50%
```

---

## Monitoring & Alerts

### Application Insights Queries

**Find Slow API Calls:**
```kusto
requests
| where duration > 1000
| order by duration desc
| take 20
```

**Track Real-Time Connections:**
```kusto
customEvents
| where name == "SocketConnected"
| summarize count() by bin(timestamp, 5m)
```

**Email Delivery Status:**
```kusto
customEvents
| where name == "EmailSent"
| summarize Success = countif(success == true),
            Failed = countif(success == false)
```

### Alert Rules

**High Error Rate:**
- Trigger: > 10 errors in 5 minutes
- Action: Email + SMS to admin

**Slow Performance:**
- Trigger: Average response time > 2s
- Action: Email notification

**Email Failures:**
- Trigger: > 5 failed emails in 1 hour
- Action: Email + create ticket

---

## Security

### Email Security
- SPF/DKIM/DMARC configured
- Rate limiting on email sends
- Unsubscribe links included
- Bounce handling

### SignalR Security
- Authentication required
- Room-based access control
- CORS restrictions
- Rate limiting

### Application Insights
- PII data masking
- Role-based access
- Data retention policies
- Compliance (GDPR, HIPAA)

---

## Cost Optimization

### Free Tier Limits
- **SignalR:** 20 concurrent connections
- **Application Insights:** 1 GB/month free
- **Communication Services:** Pay-per-use ($0.0005/email)
- **Static Web App:** 100 GB bandwidth/month

### Optimization Tips
1. Use SignalR Free tier for development
2. Sample Application Insights telemetry (50%)
3. Batch email notifications (daily digest)
4. Enable auto-scaling only when needed

---

## Troubleshooting

### Socket.IO Not Connecting
```typescript
// Check browser console
console.log('Socket status:', socket.connected);

// Verify CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

### Emails Not Sending
```typescript
// Test connection
import { isEmailServiceConfigured } from '@/services/email-service';

if (!isEmailServiceConfigured()) {
  console.error('Email service not configured');
}
```

### No Analytics Data
```typescript
// Verify initialization
import { isApplicationInsightsConfigured } from '@/services/application-insights';

console.log('App Insights:', isApplicationInsightsConfigured());
```

---

## Future Enhancements

### Planned Features
- [ ] Push notifications (mobile)
- [ ] SMS notifications via Azure Communication
- [ ] Video calls (Azure Communication Calling)
- [ ] AI-powered chatbot (Azure OpenAI)
- [ ] Advanced analytics dashboard
- [ ] A/B testing framework

### Scalability
- Multi-region deployment
- CDN integration
- Database read replicas
- Caching layer (Azure Redis)

---

## Resources

**Documentation:**
- [Azure SignalR Service](https://learn.microsoft.com/en-us/azure/azure-signalr/)
- [Azure Communication Services](https://learn.microsoft.com/en-us/azure/communication-services/)
- [Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

**Sample Code:**
- [Socket.IO React Example](https://socket.io/get-started/chat)
- [Azure Email Samples](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/communication/communication-email)
- [App Insights Telemetry](https://learn.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics)

**Support:**
- GitHub Issues
- Azure Support Portal
- Stack Overflow (tag: azure)

---

## License

MIT License - See LICENSE file for details
