# Azure Deployment Architecture Comparison

## Selected Architecture: Container Apps ✅

After analyzing requirements and Azure best practices, **Azure Container Apps with PostgreSQL Flexible Server** is the optimal choice.

---

## Architecture Comparison

| Feature | Container Apps (Selected) | Static Web Apps + Functions | App Service |
|---------|--------------------------|------------------------------|-------------|
| **Cost** | ~$55-70/month | ~$40-60/month | ~$100-150/month |
| **Code Changes** | None required ✅ | Major refactor needed ❌ | None required ✅ |
| **Auto-scaling** | Built-in ✅ | Functions only ⚠️ | Requires higher tier 💰 |
| **Container Support** | Native ✅ | No ❌ | Yes ✅ |
| **Development Match** | Exact match ✅ | Different pattern ⚠️ | Good match ✅ |
| **SSL/HTTPS** | Automatic ✅ | Automatic ✅ | Automatic ✅ |
| **Custom Domains** | Easy ✅ | Easy ✅ | Easy ✅ |
| **PostgreSQL** | Native support ✅ | Supported ✅ | Native support ✅ |
| **Session Storage** | PostgreSQL ✅ | Redis/Table required ⚠️ | PostgreSQL ✅ |
| **Cold Start** | ~2 seconds ✅ | ~3-5 seconds ⚠️ | ~1 second ✅ |
| **Deployment** | Docker image ✅ | Separate deploys ⚠️ | Git/Docker ✅ |
| **Monitoring** | Log Analytics ✅ | Application Insights ✅ | Application Insights ✅ |

---

## Why Container Apps Won

### ✅ Pros

1. **Zero Code Changes**
   - Current Express + Vite + React stack works as-is
   - Keep PostgreSQL for sessions and data
   - No need to split frontend/backend

2. **Cost-Effective**
   - Auto-scale to 0 replicas when not in use
   - Pay only for active time
   - Burstable PostgreSQL tier (~$15/month)

3. **Developer Experience**
   - Local development matches production exactly
   - Same `npm run dev` workflow
   - Docker ensures consistency

4. **Production Ready**
   - Automatic HTTPS with managed certificates
   - Built-in load balancing
   - Health checks and auto-restart
   - Rolling updates with zero downtime

5. **Security**
   - Managed identities (no passwords in code)
   - Network isolation available
   - Azure Active Directory integration ready

### ⚠️ Considerations

1. **Learning Curve**
   - Requires Docker knowledge (mitigated by provided Dockerfile)
   - Container debugging different from VMs

2. **Cold Starts**
   - First request after scale-to-zero takes ~2-3 seconds
   - Mitigated by keeping min replicas = 1 in production

---

## Alternative: Static Web Apps + Functions

This was considered but **NOT recommended** for this project.

### Why it wasn't chosen:

1. **Major Code Refactor Required**
   ```
   Current:
   └── Express server (API + Frontend)
   
   Required:
   ├── Static Web App (React only)
   └── Azure Functions (API endpoints)
       ├── /api/projects
       ├── /api/milestones
       ├── /api/messages
       └── 30+ individual functions
   ```

2. **Session Management Complexity**
   - Express sessions work perfectly now
   - Would need Redis or Table Storage
   - Additional cost and complexity

3. **Authentication Flow**
   - Current: Passport.js middleware
   - Required: Custom auth with Functions
   - Would need to rewrite Replit Auth integration

4. **File Uploads**
   - Current: Direct to Storage with middleware
   - Required: SAS tokens or proxy functions
   - More moving parts

### When Static Web Apps IS better:

- Pure JAMstack apps (no server state)
- API is just data fetching (no sessions)
- Using Azure AD B2C for auth
- Primarily static content with occasional API calls

---

## Alternative: App Service

This would work but is **more expensive** without major benefits.

### Comparison to Container Apps:

| Feature | App Service | Container Apps |
|---------|-------------|----------------|
| Cost | $100-150/month | $55-70/month |
| Scale-to-zero | No ❌ | Yes ✅ |
| Auto-scaling | Requires Standard+ tier | Built-in |
| Container support | Yes ✅ | Native ✅ |
| Best for | Traditional web apps | Microservices, modern apps |

### When App Service IS better:

- You need Always On (no cold starts ever)
- Using Windows-specific features
- Need App Service Environment (enterprise isolation)
- Legacy applications without containerization

---

## Decision Summary

**Container Apps** provides the best balance of:
- 💰 Cost (~40% cheaper than App Service)
- 🚀 Performance (auto-scaling, fast cold starts)
- 🛠️ Developer Experience (no code changes)
- 🔒 Security (managed identities, network isolation)
- 📈 Future-proofing (modern, container-native)

---

## Migration Path from Replit

Current Replit setup → Azure Container Apps:

```
Replit Environment              Azure Container Apps
==================              ====================
Node.js 20                  →   Node.js 20 container
Express server              →   Same Express server
PostgreSQL (Neon)          →   PostgreSQL Flexible Server
Vite dev server            →   Built React SPA
Port 5000                  →   Port 3000
REPL_ID, REPL_SLUG        →   AZURE_ENV_NAME
SESSION_SECRET            →   Azure Key Vault (optional)
```

### What changes:
- ✅ Environment variables (from .env to Azure secrets)
- ✅ Database connection string (Neon → Azure PostgreSQL)
- ✅ Deployment method (Git push → Docker image)

### What stays the same:
- ✅ Entire codebase
- ✅ Database schema
- ✅ API routes
- ✅ Authentication flow
- ✅ React frontend
- ✅ Session management

---

## Next Steps

1. **Deploy to Azure** (1-2 hours)
   - Follow `AZURE-SETUP-COMPLETE.md`
   - Run `azd up`
   - Migrate database

2. **Test production** (30 min)
   - Verify all portal features
   - Test authentication
   - Check performance

3. **Setup CI/CD** (optional, 1 hour)
   - GitHub Actions for auto-deploy
   - Staging environment

4. **Wix Migration** (when ready)
   - Use Azure as reference
   - Follow `docs/wix-studio-migration/`
   - Migrate users with export/import

---

## Cost Breakdown (Detailed)

### Monthly costs in East US 2:

**Container Apps:**
- Compute: $0.000024/vCPU-second + $0.000004/GiB-second
- 1 instance × 0.5 vCPU × 1 GiB × 730 hours
- ≈ $30-50/month (depending on usage)

**PostgreSQL Flexible Server:**
- Burstable B1ms (1 vCore, 2 GiB RAM)
- 32 GiB storage
- ≈ $15/month

**Container Registry:**
- Basic tier
- 10 GiB storage included
- ≈ $5/month

**Storage Account:**
- Standard LRS
- Minimal file storage
- ≈ $1-3/month

**Log Analytics:**
- 500 MB/day free tier
- ≈ $0-5/month (stays free with low traffic)

**Total: $51-78/month**

### Cost optimization:

**Development:**
- Scale Container App to 0 replicas: **$20/month**
- Delete when not testing: **$0/month**

**Production (low traffic):**
- Min 1 replica for fast responses: **$55/month**

**Production (high traffic):**
- Auto-scale 1-3 replicas: **$70-90/month**

---

## Support & Resources

- **Azure docs**: https://learn.microsoft.com/azure/container-apps/
- **Pricing calculator**: https://azure.microsoft.com/pricing/calculator/
- **Local guide**: `AZURE-SETUP-COMPLETE.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Troubleshooting**: Azure Portal → Log Analytics
