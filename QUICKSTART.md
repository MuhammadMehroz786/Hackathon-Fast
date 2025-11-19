# ⚡ Quick Start - Get Running in 5 Minutes

## Fast Track Setup

### Step 1: Install Dependencies (2 min)

```bash
# Backend
cd barfani/backend
npm install

# Frontend (in new terminal)
cd barfani/frontend
npm install
```

### Step 2: Configure Environment (1 min)

**Backend:**
```bash
cd barfani/backend
cp .env.example .env
# No need to edit - works out of the box!
```

**Frontend:**
```bash
cd barfani/frontend
cp .env.local.example .env.local

# Edit .env.local (required):
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Step 3: Start Servers (1 min)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Wait for: `🏔️  Project Barfani Backend running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Wait for: `Ready on http://localhost:3000`

**Terminal 3 - Sensor Simulation:**
```bash
cd backend
node testData.js continuous 5 normal
```

### Step 4: Open Dashboard (30 sec)

1. Open browser: `http://localhost:3000`
2. You should see:
   - Header with "Project Barfani"
   - 4 stat cards showing sensors and alerts
   - Map with sensor nodes
   - Alert panel (currently empty)

### Step 5: Trigger a Critical Alert (30 sec)

In Terminal 3, stop the current script (Ctrl+C) and run:
```bash
node testData.js continuous 3 critical
```

Watch the dashboard:
- 🔴 Map markers turn red
- 🚨 Alert sound plays
- 📊 Charts show spiking values
- ⚡ Alert panel populates with CRITICAL warnings

## 🎉 Success Checklist

- [ ] Backend running without errors
- [ ] Frontend shows dashboard
- [ ] Sensor data flowing (watch Terminal 3)
- [ ] Map shows 3 green nodes
- [ ] Critical mode triggers red alerts
- [ ] Real-time charts updating

## 🐛 Quick Troubleshooting

**Port 5000 already in use:**
```bash
# In backend/.env, change:
PORT=5001

# Then update frontend/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

**Frontend shows "Failed to fetch":**
- Ensure backend is running (`Terminal 1` shows server started)
- Check `frontend/.env.local` has correct URL
- Try restarting frontend: Ctrl+C, then `npm run dev`

**No sensor data appearing:**
- Check Terminal 3 shows "✅ Response code: 201"
- If seeing "❌ HTTP Error", backend isn't receiving data
- Restart backend and try again

**Nothing is working:**
```bash
# Nuclear option - restart everything:
# 1. Stop all terminals (Ctrl+C)
# 2. Clear node_modules:
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install

# 3. Start again from Step 3
```

## 🎯 Next Steps

**For Demo Preparation:**
1. Read `docs/PRESENTATION_GUIDE.md`
2. Practice switching between normal → critical scenarios
3. Test on projector/second screen
4. Prepare backup video recording

**For Development:**
1. Customize sensor node locations in `frontend/components/Map.tsx`
2. Adjust alert thresholds in `backend/.env`
3. Add your team info to `README.md`

**For Deployment:**
1. Set up Firebase (optional, see main README)
2. Deploy backend to Railway/Render
3. Deploy frontend to Vercel
4. Update ESP32 code with production URL

## 📞 Need Help?

- Main docs: `README.md`
- Architecture: `docs/ARCHITECTURE.md`
- ESP32 setup: `sensor/README.md`
- API testing: Use Postman with `http://localhost:5000/api/health`

---

**You're all set! Time to win this hackathon! 🏆**
