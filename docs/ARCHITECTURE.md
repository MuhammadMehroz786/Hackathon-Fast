# Project Barfani - System Architecture

## Overview

Project Barfani is a three-tier IoT system for glacier monitoring and GLOF early warning.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     SENSOR LAYER (Track 1)                        │
│                                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ ESP32 Node 1│  │ ESP32 Node 2│  │ ESP32 Node 3│              │
│  │             │  │             │  │             │              │
│  │ - DHT22     │  │ - DHT22     │  │ - DHT22     │              │
│  │ - SW-420    │  │ - SW-420    │  │ - SW-420    │              │
│  │ - HC-SR04   │  │ - HC-SR04   │  │ - HC-SR04   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                 │                 │                     │
│         └─────────────────┴─────────────────┘                     │
│                           │                                       │
│                      WiFi/LoRa                                    │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND LAYER (Track 2)                         │
│                                                                    │
│  ┌────────────────────────────────────────────────────────┐      │
│  │              Express.js REST API Server                 │      │
│  │                                                          │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │      │
│  │  │    Routes    │  │    Alert     │  │  Firebase   │  │      │
│  │  │              │  │    Engine    │  │   Database  │  │      │
│  │  │ - Sensor     │  │              │  │             │  │      │
│  │  │ - Alerts     │──▶│ - Risk Calc  │──▶│ - Sensors  │  │      │
│  │  │ - Analytics  │  │ - Thresholds │  │ - Alerts    │  │      │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │      │
│  │                                                          │      │
│  │  ┌──────────────────────────────────────────────────┐  │      │
│  │  │           Socket.io Real-time Server             │  │      │
│  │  │  - Broadcasts sensor updates                     │  │      │
│  │  │  - Pushes alerts to connected clients            │  │      │
│  │  └──────────────────────────────────────────────────┘  │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                    │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                     WebSocket + HTTP
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                  FRONTEND LAYER (Track 3)                         │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              Next.js React Application                   │     │
│  │                                                           │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │     │
│  │  │   Header     │  │     Map      │  │  Alert Panel │  │     │
│  │  │ - Branding   │  │ - Nodes      │  │ - Live Feed  │  │     │
│  │  │ - Lang Toggle│  │ - Risk Colors│  │ - Urdu/Eng   │  │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │     │
│  │                                                           │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │     │
│  │  │ Stats Cards  │  │  Dashboard   │  │  Charts      │  │     │
│  │  │ - Sensors    │  │ - Metrics    │  │ - Trends     │  │     │
│  │  │ - Alerts     │  │ - Battery    │  │ - History    │  │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │     │
│  │                                                           │     │
│  │  ┌─────────────────────────────────────────────────┐    │     │
│  │  │              Custom Hooks                        │    │     │
│  │  │  - useSocket (real-time connection)             │    │     │
│  │  │  - useSensorData (API polling)                  │    │     │
│  │  └─────────────────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Sensor Reading Flow
```
ESP32 Sensors → WiFi → HTTP POST → Backend API → Firebase → Socket.io → Dashboard
```

### 2. Alert Generation Flow
```
Sensor Data → Alert Engine → Risk Assessment → Alert Storage → Real-time Broadcast
```

### 3. Dashboard Update Flow
```
User Opens Dashboard → Fetch Initial Data → Establish Socket Connection → Receive Real-time Updates
```

## Component Details

### ESP32 Sensor Nodes
**Purpose:** Collect environmental data from glacier sites

**Components:**
- **DHT22:** Temperature & humidity (-40°C to 80°C)
- **SW-420:** Vibration/seismic detection (digital + analog)
- **HC-SR04:** Ultrasonic distance measurement for water level
- **Battery:** Simulated solar + battery power

**Data Format:**
```json
{
  "node_id": "glacier_lake_01",
  "timestamp": "2025-01-18T10:30:00Z",
  "temperature": -5.2,
  "seismic_activity": 0.3,
  "water_level": 245.6,
  "battery": 87,
  "signal_strength": 92
}
```

**Communication:**
- WiFi (for simulation)
- Production: LoRaWAN (long-range, low-power)
- Fallback: Satellite (for extreme remote areas)

### Backend API Server

**Technology:** Node.js + Express + Socket.io

**Key Modules:**

1. **Sensor Routes (`/api/sensor/*`)**
   - Receive sensor data
   - Store in database
   - Return confirmation

2. **Alert Routes (`/api/alerts/*`)**
   - Query alerts
   - Filter by risk level
   - Get active warnings

3. **Analytics Routes (`/api/analytics/*`)**
   - System overview
   - Historical trends
   - Node statistics

4. **Alert Engine**
   - Analyzes incoming sensor data
   - Calculates risk scores
   - Determines alert level
   - Generates messages (English + Urdu)

**Alert Algorithm:**
```javascript
riskScore = 0

if (temperature > 10°C) riskScore += 30
if (seismic > 0.5) riskScore += 35
if (waterLevelIncrease > 20%) riskScore += 35
if (all three conditions) riskScore += 40  // Combined risk bonus

// Risk level classification
if (riskScore >= 70) → CRITICAL
else if (riskScore >= 40) → HIGH
else if (riskScore >= 20) → MEDIUM
else → LOW
```

### Frontend Dashboard

**Technology:** Next.js 14 + TypeScript + Tailwind CSS

**Key Features:**

1. **Real-time Map**
   - Shows sensor node locations
   - Color-coded by risk level
   - Click for detailed info

2. **Alert Panel**
   - Live alert feed
   - Bilingual messages
   - Sound notifications

3. **Analytics Dashboard**
   - Live charts (Recharts)
   - Historical trends
   - System metrics

4. **Responsive Design**
   - Desktop optimized
   - Mobile friendly
   - Tablet support

## Database Schema

### Firebase Realtime Database Structure
```
barfani/
├── sensor_data/
│   ├── glacier_lake_01/
│   │   ├── {pushId1}: { timestamp, temperature, seismic, ... }
│   │   ├── {pushId2}: { ... }
│   │   └── ...
│   ├── glacier_lake_02/
│   └── glacier_lake_03/
│
└── alerts/
    ├── {pushId1}: { node_id, riskLevel, timestamp, ... }
    ├── {pushId2}: { ... }
    └── ...
```

## Security Considerations

1. **API Authentication** (for production):
   - API key validation
   - Rate limiting
   - CORS policies

2. **Data Validation:**
   - Input sanitization
   - Schema validation
   - Range checking

3. **Secure Communication:**
   - HTTPS for production
   - WSS for WebSocket
   - Encrypted sensor data

## Scalability

**Current Capacity:**
- Handles 10+ sensor nodes
- 1000+ readings/day
- Real-time updates for 100+ users

**Production Scaling:**
- Load balancer for multiple backend instances
- Redis for caching
- Database sharding by region
- CDN for frontend assets

## Monitoring & Maintenance

1. **System Health:**
   - `/api/health` endpoint
   - Uptime monitoring
   - Error logging

2. **Sensor Health:**
   - Battery level tracking
   - Signal strength monitoring
   - Last-seen timestamps

3. **Alert Performance:**
   - False positive tracking
   - Alert response times
   - Accuracy metrics

## Deployment Architecture

### Development
```
Local Machine → Wokwi Simulator → localhost:5000 → localhost:3000
```

### Production
```
ESP32/LoRa → Cloud Backend (Railway/Render) → CDN Frontend (Vercel)
```

## Future Enhancements

1. **ML/AI Improvements:**
   - LSTM for time-series prediction
   - Anomaly detection
   - Pattern recognition

2. **Communication:**
   - SMS alerts via Twilio
   - WhatsApp integration
   - Emergency broadcast system

3. **Sensors:**
   - Camera feeds
   - Weather stations
   - GPS tracking for ice movement

4. **Mobile App:**
   - React Native
   - Offline support
   - Push notifications

---

**Document Version:** 1.0
**Last Updated:** January 2025
