# 🚂 Railway Deployment - Quick Start (5 Minutes)

**Fast track to get Barfani running on Railway!**

---

## Option 1: Web UI Deployment (Recommended for Beginners)

### Step 1: Push to GitHub (2 min)

```bash
cd /Users/apple/Desktop/Fast\ Hackathon/barfani
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/barfani.git
git push -u origin main
```

### Step 2: Deploy Backend (2 min)

1. Go to **https://railway.app** → New Project → Deploy from GitHub
2. Select `barfani` repository
3. Add New Service → Settings:
   - Root Directory: `backend`
   - Start Command: `npm start`
4. Add Variables:
   ```
   PORT=5001
   NODE_ENV=production
   ```
5. Generate Domain → **Copy URL** (e.g., `https://backend-xyz.railway.app`)

### Step 3: Deploy Frontend (1 min)

1. Same project → Add Service → Settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
2. Add Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.railway.app
   ```
3. Generate Domain → **Visit URL** → ✅ Done!

---

## Option 2: CLI Deployment (For Advanced Users)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../frontend
railway init
railway up

# Done! ✅
railway open
```

---

## Option 3: One-Click Deploy (Coming Soon)

Click this button to deploy automatically:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/...)

---

## Verify Deployment ✅

**Backend Health Check:**
```
https://your-backend-url.railway.app/api/health
```
Should return: `{"status":"healthy",...}`

**Frontend:**
```
https://your-frontend-url.railway.app
```
Should show the Barfani dashboard

**WebSocket:**
Open browser console → should see: `✅ Connected to Barfani backend`

---

## Need Email Alerts? (Optional)

Add to backend environment variables:

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
ALERT_EMAIL_PDMA=alert@example.com
```

**Get Gmail App Password**: https://myaccount.google.com/apppasswords

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check Railway logs for errors |
| Frontend can't connect | Verify `NEXT_PUBLIC_API_URL` is correct |
| WebSocket disconnects | Check CORS: add `FRONTEND_URL` to backend |
| Build fails | Ensure Node.js v18+ in Railway settings |

---

## Full Documentation

- **Detailed Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Pre-deployment Check**: Run `./deploy.sh`

---

## Cost

- **Free Tier**: $5/month credit (perfect for testing)
- **Pro Tier**: $20/month (for production)

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Issues: Open a GitHub issue

---

**Total Time**: 5-10 minutes
**Difficulty**: ⭐⭐☆☆☆ (Easy)

**Happy Deploying! 🚀🏔️**
