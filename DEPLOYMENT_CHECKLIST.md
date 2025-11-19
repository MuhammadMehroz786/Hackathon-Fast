# Railway Deployment Checklist ✅

Use this checklist to ensure a smooth deployment to Railway.

## Pre-Deployment

- [ ] **Code is in GitHub repository**
  - Repository is public or Railway has access
  - Latest code is pushed to `main` branch

- [ ] **Environment variables prepared**
  - Review `backend/.env.example`
  - Review `frontend/.env.production`
  - Have Gmail App Password ready (if using email alerts)
  - Have Firebase credentials ready (if using Firebase)

- [ ] **Dependencies installed locally**
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```

- [ ] **Test locally**
  ```bash
  # Terminal 1 - Backend
  cd backend && npm run dev

  # Terminal 2 - Frontend
  cd frontend && npm run dev
  ```

## Railway Account Setup

- [ ] **Create Railway account** at railway.app
- [ ] **Install Railway CLI** (optional but recommended)
  ```bash
  npm i -g @railway/cli
  railway login
  ```

## Backend Deployment

- [ ] **Create new Railway project**
- [ ] **Add backend service from GitHub**
- [ ] **Set root directory to `backend`**
- [ ] **Configure environment variables**:
  - `PORT` = 5001
  - `NODE_ENV` = production
  - `TEMP_THRESHOLD` = 10
  - `SEISMIC_THRESHOLD` = 0.5
  - `WATER_LEVEL_INCREASE_THRESHOLD` = 20
  - Add email variables (if using)
  - Add Firebase variables (if using)
- [ ] **Generate public domain**
- [ ] **Copy backend URL** (save for frontend setup)
- [ ] **Verify deployment** - check `/api/health` endpoint
- [ ] **Check logs** - should see "🏔️ Project Barfani Backend running"

## Frontend Deployment

- [ ] **Add frontend service to same project**
- [ ] **Set root directory to `frontend`**
- [ ] **Configure environment variables**:
  - `NEXT_PUBLIC_API_URL` = [YOUR_BACKEND_URL]
  - `NEXT_PUBLIC_SOCKET_URL` = [YOUR_BACKEND_URL]
  - `NEXT_PUBLIC_MAPBOX_TOKEN` = [optional]
- [ ] **Generate public domain**
- [ ] **Copy frontend URL**
- [ ] **Update backend CORS**:
  - Add `FRONTEND_URL` = [YOUR_FRONTEND_URL] to backend env vars
- [ ] **Trigger redeploy** (both services)
- [ ] **Verify deployment** - visit frontend URL
- [ ] **Check browser console** - should see "✅ Connected to Barfani backend"

## Post-Deployment Testing

- [ ] **Test WebSocket connection**
  - Open frontend in browser
  - Check for connection status in UI
  - Verify real-time updates work

- [ ] **Test sensor data submission**
  ```bash
  curl -X POST [YOUR_BACKEND_URL]/api/sensor/data \
    -H "Content-Type: application/json" \
    -d '{
      "node_id": "TEST_001",
      "temperature": 8.5,
      "seismic_activity": 0.6,
      "water_level": 290,
      "battery": 75,
      "latitude": 36.3167,
      "longitude": 74.6500
    }'
  ```

- [ ] **Verify ML insights load**
  - Check ML Insights panel on dashboard
  - Should show analysis for test data

- [ ] **Test alert system** (if email configured)
  - Send high-risk data
  - Check if alert email is received

- [ ] **Test on mobile device**
  - Visit frontend URL on phone
  - Verify responsive design works

## Monitoring & Maintenance

- [ ] **Set up Railway alerts**
  - Configure downtime notifications
  - Set up deployment notifications

- [ ] **Bookmark important URLs**:
  - Railway Dashboard
  - Backend URL
  - Frontend URL
  - Backend Health Check

- [ ] **Document credentials**
  - Save Railway project ID
  - Save environment variables (securely!)
  - Save Firebase project details

## Optional Enhancements

- [ ] **Custom domain** (if you have one)
  - Configure DNS records
  - Add custom domain in Railway

- [ ] **Upgrade plan** (if needed)
  - Free tier: Development/testing
  - Pro plan: Production use

- [ ] **Set up monitoring**
  - UptimeRobot for uptime monitoring
  - Sentry for error tracking
  - Google Analytics for usage

- [ ] **Configure CI/CD notifications**
  - Slack/Discord webhooks
  - Email notifications on deploy

## Troubleshooting Commands

If something goes wrong:

```bash
# View logs
railway logs --service backend
railway logs --service frontend

# Restart service
railway restart --service backend

# Check environment variables
railway variables --service backend

# Redeploy
railway up --service backend
```

## Success Criteria ✅

Your deployment is successful when:

1. ✅ Backend health check returns HTTP 200
2. ✅ Frontend loads without errors
3. ✅ WebSocket connection established (check browser console)
4. ✅ Can submit test sensor data
5. ✅ ML insights display correctly
6. ✅ No errors in Railway logs
7. ✅ Mobile responsive design works

## Deployment Time

- **Backend**: ~3-5 minutes
- **Frontend**: ~5-7 minutes
- **Total**: ~10-15 minutes

## Estimated Costs

- **Hobby Plan**: $0-5/month (includes $5 free credit)
- **Pro Plan**: $20/month (recommended for production)

---

## Need Help?

- 📚 Read full guide: `DEPLOYMENT.md`
- 🆘 Railway Docs: https://docs.railway.app
- 💬 Railway Discord: https://discord.gg/railway
- 📧 Email: support@railway.app

---

**Last Updated**: 2025-11-20
**Deployment Target**: Railway.app
**Project**: Barfani GLOF Early Warning System
