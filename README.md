# 🏔️ Project Barfani - Glacier Monitoring & GLOF Early Warning System

**ACM Coders Cup 2025 - Problem 2 Solution**

A comprehensive IoT-based glacier monitoring system designed to detect and provide early warnings for Glacial Lake Outburst Floods (GLOFs) in Northern Pakistan.

## 📊 Presentation

**View our pitch deck:** [Project Barfani Presentation](https://gamma.app/docs/Project-Barfani--mn700fciagf8buo)

## 🎯 Problem Statement

Northern Pakistan's glaciers are melting at an alarming rate, creating unstable glacial lakes that can cause catastrophic floods (GLOFs). This system provides real-time monitoring and early warning capabilities to save lives and infrastructure.

## 🏗️ System Architecture

```
┌─────────────────┐
│  ESP32 Sensors  │  (Wokwi Simulation)
│  - Temperature  │
│  - Seismic      │
│  - Water Level  │
└────────┬────────┘
         │ HTTP/MQTT
         ▼
┌─────────────────┐
│  Backend API    │  (Node.js + Express)
│  - Data Storage │
│  - Alert Engine │
│  - AI Logic     │
└────────┬────────┘
         │ Socket.io
         ▼
┌─────────────────┐
│   Dashboard     │  (Next.js + React)
│  - Live Map     │
│  - Alerts       │
│  - Analytics    │
└─────────────────┘
```

## 📊 Tech Stack

### Track 1: IoT Sensor Simulation
- **Platform:** Wokwi (ESP32 online simulator)
- **Sensors:**
  - DHT22 - Temperature (-20°C to +15°C)
  - SW-420 - Seismic activity detection
  - HC-SR04 - Water level measurement
- **Communication:** WiFi + HTTP

### Track 2: Backend (The Brain)
- **Runtime:** Node.js + Express
- **Database:** Firebase Realtime Database (with in-memory fallback)
- **Real-time:** Socket.io for live updates
- **AI/ML:** Rule-based alert engine with predictive logic
- **APIs:** RESTful endpoints for all operations

### Track 3: Frontend (The Lifeline)
- **Framework:** Next.js 14 (React + TypeScript)
- **Styling:** Tailwind CSS
- **Maps:** Interactive sensor visualization
- **Charts:** Recharts for data visualization
- **Features:** English + Urdu language support

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- Git
- A modern web browser

### 1️⃣ Clone and Setup

```bash
cd barfani
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration (or leave as-is for testing)
# For quick testing, it works without Firebase using in-memory storage

# Start backend
npm run dev
```

Backend will run at `http://localhost:5000`

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000
# NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Start frontend
npm run dev
```

Frontend will run at `http://localhost:3000`

### 4️⃣ Sensor Simulation (Wokwi)

**Option A: Quick Test with Backend Data Generator**
```bash
cd backend
node testData.js continuous 5 normal
```
This sends simulated sensor data to your backend every 5 seconds.

**Option B: Full ESP32 Simulation**
1. Go to [Wokwi.com](https://wokwi.com/projects/new/esp32)
2. Copy code from `sensor/esp32_glacier_monitor.ino`
3. Paste into Wokwi editor
4. Update line 16 with your backend URL (use ngrok for local testing)
5. Click "Start Simulation"

See `sensor/README.md` for detailed instructions.

## 📱 Features

### Dashboard Features
✅ Real-time sensor data visualization
✅ Interactive map with sensor nodes
✅ Live alert notifications with sound
✅ Risk level indicators (LOW/MEDIUM/HIGH/CRITICAL)
✅ Historical data charts
✅ Multi-language support (English/Urdu)
✅ Responsive design

### Backend Features
✅ RESTful API with comprehensive endpoints
✅ Real-time WebSocket communication
✅ AI-powered risk assessment
✅ Alert engine with multiple thresholds
✅ Firebase integration (optional)
✅ In-memory fallback for demos

### Alert Logic (AI Component)
The system uses intelligent rule-based algorithms to detect GLOF risks:

**Risk Factors:**
- Temperature > 10°C: +30 risk points
- Seismic activity > 0.5: +35 risk points
- Water level increase > 20% in 1 hour: +35 risk points
- **Combined risk** (all three): +40 bonus points

**Risk Levels:**
- 0-19: LOW (green)
- 20-39: MEDIUM (yellow)
- 40-69: HIGH (orange)
- 70+: CRITICAL (red, triggers emergency alerts)

## 📡 API Documentation

### Sensor Endpoints

**POST** `/api/sensor/data`
```json
{
  "node_id": "glacier_lake_01",
  "temperature": -5.2,
  "seismic_activity": 0.3,
  "water_level": 245.6,
  "battery": 87
}
```

**GET** `/api/sensor/nodes`
- Returns all active sensor nodes with latest readings

**GET** `/api/sensor/node/:nodeId`
- Get historical data for specific node

### Alert Endpoints

**GET** `/api/alerts`
- Get all alerts (supports filtering by risk level and node)

**GET** `/api/alerts/active`
- Get currently active CRITICAL/HIGH alerts

**GET** `/api/alerts/stats`
- Get alert statistics

### Analytics Endpoints

**GET** `/api/analytics/overview`
- System-wide overview and metrics

**GET** `/api/analytics/trends/:nodeId`
- Historical trends for specific node

## 🧪 Testing Scenarios

### Test 1: Normal Conditions
```bash
node testData.js test
```
Sends normal readings, should show LOW risk.

### Test 2: Warning Simulation
```bash
node testData.js continuous 5 warning
```
Sends elevated readings, should trigger MEDIUM/HIGH alerts.

### Test 3: Critical Emergency
```bash
node testData.js continuous 5 critical
```
Sends dangerous readings, should trigger CRITICAL alerts with sounds.

## 🎨 Demo Screenshots

The dashboard includes:
- **Header:** Project branding with language toggle
- **Stats Overview:** 4 key metric cards
- **Interactive Map:** Sensor nodes with color-coded risk levels
- **Alert Panel:** Real-time alert feed with Urdu support
- **Charts:** Live sensor data visualization
- **Responsive Design:** Works on desktop, tablet, and mobile

## 🔧 Configuration

### Firebase Setup (Optional)
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Realtime Database
3. Create a service account and download credentials
4. Update `backend/.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

**Note:** System works without Firebase using in-memory storage for demos!

### Alert Thresholds
Customize in `backend/.env`:
```env
TEMP_THRESHOLD=10          # Temperature in °C
SEISMIC_THRESHOLD=0.5      # Seismic magnitude
WATER_LEVEL_INCREASE_THRESHOLD=20  # Percentage increase
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)
1. Create account on [Railway.app](https://railway.app)
2. Connect GitHub repo
3. Add environment variables
4. Deploy

### Frontend Deployment (Vercel)
1. Create account on [Vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url`
4. Deploy

## 📝 Project Structure

```
barfani/
├── backend/
│   ├── config/          # Firebase configuration
│   ├── routes/          # API route handlers
│   ├── utils/           # Alert engine & utilities
│   ├── server.js        # Main server file
│   ├── testData.js      # Data generator for testing
│   └── package.json
├── frontend/
│   ├── app/             # Next.js app router
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   └── package.json
├── sensor/
│   ├── esp32_glacier_monitor.ino  # Arduino code
│   ├── diagram.json     # Wokwi circuit diagram
│   └── README.md
└── README.md
```

## 🎯 Hackathon Deliverables

### ✅ Completed Requirements

**Track 1: Sensor Simulation**
- ✅ Complete ESP32 code with 3 sensors
- ✅ Wokwi-compatible simulation
- ✅ Realistic data patterns
- ✅ Power management simulation

**Track 2: Backend & Intelligence**
- ✅ Cloud-ready backend (Node.js + Express)
- ✅ Firebase integration with fallback
- ✅ AI/ML alert engine
- ✅ RESTful APIs
- ✅ Real-time WebSocket communication

**Track 3: Dashboard & UX**
- ✅ Professional web dashboard
- ✅ Real-time sensor visualization
- ✅ Interactive map
- ✅ Alert management system
- ✅ Multi-language support (English + Urdu)
- ✅ Mobile responsive design

**Bonus Features**
- ✅ Sound alerts for critical events
- ✅ Historical data analytics
- ✅ Battery monitoring
- ✅ Complete API documentation
- ✅ Easy deployment setup

## 🏆 Winning Features

1. **Complete End-to-End System:** All three tracks fully implemented
2. **Real Working Demo:** Can be demonstrated live during presentation
3. **Professional UI/UX:** Production-ready dashboard design
4. **Scalable Architecture:** Cloud-ready, can handle multiple nodes
5. **Social Impact:** Addresses real problem in Pakistan
6. **Technical Excellence:** Modern tech stack, clean code, well documented
7. **Bilingual Support:** Shows cultural awareness
8. **Innovation:** AI-powered risk assessment with combined factor analysis

## 👥 Team Information

Update this section with your team details for submission.

## 📄 License

MIT License - Built for ACM Coders Cup 2025

## 🆘 Troubleshooting

**Port already in use:**
```bash
# Backend
PORT=5001 npm run dev

# Frontend
PORT=3001 npm run dev
```

**CORS errors:**
- Update `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Restart both backend and frontend

**Sensor not sending data:**
- Check backend URL in ESP32 code
- Use ngrok for local testing: `ngrok http 5000`
- Update `serverUrl` in Arduino code with ngrok URL

**No real-time updates:**
- Check Socket.io connection in browser console
- Verify `NEXT_PUBLIC_SOCKET_URL` is correct

## 📞 Support

For questions during the hackathon:
- Check `docs/` folder for additional documentation
- Review API endpoints in Postman/Insomnia
- Test with `testData.js` for quick validation

## 🔗 Links

- **Presentation:** [View Pitch Deck](https://gamma.app/docs/Project-Barfani--mn700fciagf8buo)
- **GitHub Repository:** [MuhammadMehroz786/Hackathon-Fast](https://github.com/MuhammadMehroz786/Hackathon-Fast)
- **Live Demo:** (Add your deployed URL here)

---

**Built with ❤️ for saving lives in Northern Pakistan**

**Project Barfani** - From Glaciers to Communities, Monitoring for Tomorrow
