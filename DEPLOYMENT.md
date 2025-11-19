# Railway Deployment Guide - Project Barfani

This guide will walk you through deploying the Barfani GLOF Early Warning System on Railway.

## Overview

The project consists of two services:
- **Backend**: Node.js/Express API with Socket.IO (Port 5001)
- **Frontend**: Next.js application (Port 3000)

---

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Email Account**: Gmail account with App Password for alerts (optional)
4. **Firebase Project**: For data persistence (optional, uses in-memory storage otherwise)

---

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
```bash
cd /Users/apple/Desktop/Fast\ Hackathon/barfani
git init
git add .
git commit -m "Initial commit - Barfani GLOF System"
```

2. **Create GitHub Repository**:
   - Go to github.com and create a new repository
   - Follow instructions to push your local code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/barfani.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Backend Service

1. **Go to Railway Dashboard**: https://railway.app/dashboard

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `barfani` repository

3. **Configure Backend Service**:
   - Railway will detect it's a monorepo
   - Click "Add Service" → "GitHub Repo"
   - Set **Root Directory**: `backend`
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`

4. **Add Environment Variables**:
   Go to the Backend service → Variables tab and add:

   ```
   PORT=5001
   NODE_ENV=production
   TEMP_THRESHOLD=10
   SEISMIC_THRESHOLD=0.5
   WATER_LEVEL_INCREASE_THRESHOLD=20
   ```

   **Optional - Email Alerts**:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   ALERT_EMAIL_PDMA=alert1@example.com
   ALERT_EMAIL_EMERGENCY=alert2@example.com
   ALERT_EMAIL_COMMUNITY=alert3@example.com
   ```

   **Optional - Firebase**:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   ```

5. **Generate Domain**:
   - Go to Settings → Generate Domain
   - Copy the URL (e.g., `https://barfani-backend-production.up.railway.app`)
   - **Save this URL** - you'll need it for the frontend!

6. **Deploy**:
   - Click "Deploy" or push a commit to trigger deployment
   - Wait for build to complete (~2-3 minutes)
   - Check logs to ensure it's running: "🏔️ Project Barfani Backend running on port 5001"

---

### Step 3: Deploy Frontend Service

1. **Add Frontend Service**:
   - In the same Railway project, click "New Service"
   - Select "GitHub Repo" again
   - Set **Root Directory**: `frontend`
   - Set **Build Command**: `npm install && npm run build`
   - Set **Start Command**: `npm start`

2. **Add Environment Variables**:
   Go to Frontend service → Variables tab and add:

   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.railway.app
   ```

   Replace `your-backend-url.railway.app` with the actual backend URL from Step 2.5

   **Optional - Mapbox**:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token
   ```

3. **Generate Domain**:
   - Go to Settings → Generate Domain
   - Copy the URL (e.g., `https://barfani-frontend-production.up.railway.app`)

4. **Update Backend CORS**:
   - Go back to Backend service → Variables
   - Add: `FRONTEND_URL=https://your-frontend-url.railway.app`

5. **Deploy**:
   - Both services will auto-deploy
   - Wait for builds to complete

---

### Step 4: Verify Deployment

1. **Check Backend Health**:
   - Visit: `https://your-backend-url.railway.app/api/health`
   - Should see: `{"status":"healthy","timestamp":"...","service":"Project Barfani Backend"}`

2. **Check Frontend**:
   - Visit: `https://your-frontend-url.railway.app`
   - Should see the Barfani dashboard load

3. **Test WebSocket Connection**:
   - Open browser console on frontend
   - Look for: "✅ Connected to Barfani backend"

4. **Test Sensor Data** (Optional):
   - Send test data to backend:
   ```bash
   curl -X POST https://your-backend-url.railway.app/api/sensor/data \
     -H "Content-Type: application/json" \
     -d '{
       "node_id": "HUNZA_001",
       "temperature": 5.2,
       "seismic_activity": 0.3,
       "water_level": 285.5,
       "battery": 85,
       "latitude": 36.3167,
       "longitude": 74.6500
     }'
   ```

---

## Configuration Options

### Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `5001` |
| `NODE_ENV` | Yes | Environment | `production` |
| `FRONTEND_URL` | Yes | Frontend URL for CORS | `https://app.railway.app` |
| `TEMP_THRESHOLD` | No | Temperature alert threshold (°C) | `10` |
| `SEISMIC_THRESHOLD` | No | Seismic activity threshold | `0.5` |
| `WATER_LEVEL_INCREASE_THRESHOLD` | No | Water level % increase | `20` |
| `EMAIL_SERVICE` | No | Email provider | `gmail` |
| `EMAIL_USER` | No | Sender email | `alerts@example.com` |
| `EMAIL_PASSWORD` | No | Email app password | `xxxx xxxx xxxx xxxx` |

### Frontend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `https://api.railway.app` |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | WebSocket URL (same as API) | `https://api.railway.app` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | Mapbox access token | `pk.eyJ1...` |

---

## Alternative: Single Command Deployment

You can also use Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway up

# Deploy frontend (in new terminal)
cd frontend
railway up
```

---

## Troubleshooting

### Backend won't start
- Check logs in Railway dashboard
- Verify all required environment variables are set
- Ensure `package.json` has correct start script

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` matches backend domain
- Check backend CORS settings (`FRONTEND_URL`)
- Inspect browser console for connection errors

### WebSocket disconnects
- Railway uses WebSocket-compatible networking
- Check firewall/proxy settings if using VPN
- Verify backend is generating a public domain (not internal)

### Email alerts not sending
- Use Gmail App Passwords (not regular password)
- Enable "Less secure app access" OR use App Password
- Verify EMAIL_USER and EMAIL_PASSWORD are correct

---

## Monitoring & Logs

1. **View Logs**:
   - Railway Dashboard → Your Service → Deployments → View Logs

2. **Metrics**:
   - Railway Dashboard → Your Service → Metrics
   - Monitor CPU, Memory, Network usage

3. **Alerts**:
   - Set up Railway alerts for service downtime
   - Configure email notifications in Railway settings

---

## Scaling & Performance

Railway automatically handles:
- ✅ HTTPS/SSL certificates
- ✅ CDN for static assets
- ✅ Auto-restart on crashes
- ✅ Health checks
- ✅ Gzip compression (enabled in code)
- ✅ WebSocket support

For high traffic:
- Upgrade to Railway Pro plan
- Consider adding Redis for caching
- Enable Railway autoscaling

---

## Cost Estimate

**Hobby Plan (Free)**:
- $5 free credit/month
- Suitable for development & testing
- ~1000 requests/day

**Pro Plan ($20/month)**:
- $20 credit/month
- Production-ready
- Better performance & uptime
- Custom domains

---

## Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] Using environment variables (not hardcoded secrets)
- [ ] CORS is configured with specific frontend URL
- [ ] Firebase credentials use service account (if applicable)
- [ ] Gmail using App Password (not main password)
- [ ] Rate limiting enabled (consider adding express-rate-limit)

---

## Next Steps After Deployment

1. **Custom Domain** (Optional):
   - Railway → Settings → Add Custom Domain
   - Configure DNS records

2. **CI/CD**:
   - Already enabled! Push to GitHub = auto-deploy

3. **Connect Real Sensors**:
   - Update sensor firmware with production backend URL
   - Test sensor data transmission

4. **Set Up Monitoring**:
   - Configure Railway webhooks
   - Set up uptime monitoring (UptimeRobot, Pingdom)

5. **Team Access**:
   - Railway → Settings → Members
   - Invite team members

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Project Repository**: [Your GitHub URL]
- **Email Support**: support@railway.app

---

## Quick Reference Commands

```bash
# View backend logs
railway logs --service backend

# View frontend logs
railway logs --service frontend

# Restart service
railway restart --service backend

# Open service URL
railway open

# Environment variables
railway variables
```

---

**Deployment Time**: ~10-15 minutes
**Estimated Cost**: $0-5/month (Hobby) or $20/month (Pro)
**Uptime**: 99.9% (Railway SLA)

---

## Questions?

If you encounter issues:
1. Check Railway logs first
2. Review this guide's troubleshooting section
3. Check Railway status page: https://status.railway.app
4. Contact Railway support or open GitHub issue

**Happy Deploying! 🚀🏔️**
