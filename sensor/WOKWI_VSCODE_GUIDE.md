# Wokwi for VS Code - Setup Guide
## Run ESP32 Simulation Directly in VS Code

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Wokwi Extension

1. **Open VS Code**
   - Already have VS Code open? Perfect!

2. **Install Wokwi Extension:**
   - Press `Cmd+Shift+X` (macOS) or `Ctrl+Shift+X` (Windows/Linux)
   - Search for "**Wokwi Simulator**"
   - Click **Install** on the extension by Wokwi

   Or use command line:
   ```bash
   code --install-extension wokwi.wokwi-vscode
   ```

3. **Get Wokwi License (Free for Hackathons!):**
   - Go to https://wokwi.com/vscode
   - Sign up with GitHub (free)
   - Get your license key
   - In VS Code: Press `F1` → Type "Wokwi: Request License"
   - Paste your license key

---

## Step 2: Prepare the Project

Your files are already set up! Just verify:

```bash
cd "/Users/apple/Desktop/Fast Hackathon/barfani/sensor/esp32_glof_sensor"
ls

# You should see:
# - esp32_glof_sensor.ino
# - diagram.json
# - wokwi.toml
```

---

## Step 3: Update WiFi Configuration

Before running, update the WiFi settings to connect to your local backend:

1. **Open** `esp32_glof_sensor.ino`

2. **Find these lines** (around line 22-24):
   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   ```

3. **Replace with:**
   ```cpp
   const char* WIFI_SSID = "Wokwi-GUEST";
   const char* WIFI_PASSWORD = "";
   ```

4. **Find the API URL** (around line 27):
   ```cpp
   const char* API_URL = "http://YOUR_SERVER_IP:5001/api/sensor/data";
   ```

5. **Replace with:**
   ```cpp
   const char* API_URL = "http://localhost:5001/api/sensor/data";
   ```

---

## Step 4: Run the Simulation!

1. **Open the .ino file** in VS Code:
   ```bash
   code esp32_glof_sensor.ino
   ```

2. **Start Wokwi Simulator:**
   - Press `F1` (or `Cmd+Shift+P` on Mac)
   - Type "**Wokwi: Start Simulator**"
   - Press Enter

   **OR** click the Wokwi icon (triangle play button) in the top right corner

3. **Watch it boot!**
   - The simulation window opens
   - Serial monitor appears at the bottom
   - See the sensors light up!

---

## 🎮 Using the Simulation

### Viewing the Circuit:
- The circuit diagram appears automatically
- See all 3 sensors connected to ESP32
- Interactive components you can control

### Serial Monitor:
- Automatically opens at bottom of VS Code
- Baud rate: 115200 (already configured)
- Shows real-time sensor readings

### Controlling Sensors:

**Temperature (DHT22):**
- Click on the DHT22 sensor in the diagram
- Properties panel appears on the right
- Adjust "Temperature" slider: -20°C to +50°C
- Adjust "Humidity" slider: 0% to 100%

**Water Level (HC-SR04):**
- Click on the HC-SR04 sensor
- Adjust "Distance" slider: 2cm to 400cm
- Lower distance = higher water level!

**Seismic Activity (Potentiometer):**
- Click and drag the slider
- 0 = no vibration
- 4095 = maximum seismic activity

**Status LED:**
- Watch the green LED blink
- Shows WiFi status and data transmission

---

## 🔌 Connecting to Your Local Backend

The simulation can communicate with your backend running on localhost!

### Ensure Backend is Running:

```bash
# In a terminal:
cd "/Users/apple/Desktop/Fast Hackathon/barfani/backend"
npm run dev

# You should see:
# 🏔️  Project Barfani Backend running on port 5001
```

### The simulation will automatically:
1. Connect to WiFi (simulated)
2. Send HTTP POST to `http://localhost:5001/api/sensor/data`
3. Your backend receives the data
4. Dashboard updates in real-time!

---

## 🎯 Demo Scenarios for Hackathon

### Scenario 1: Normal Glacier Monitoring

**Steps:**
1. Start simulation
2. Set temperature to -5°C
3. Set water distance to 200cm
4. Set seismic slider to 512 (middle)

**Expected Serial Output:**
```
🌡️  Temperature: -10.65°C (adjusted for 3400m elevation)
📊 Seismic Activity: 0.251 magnitude
💧 Water Level: 300.00cm
📤 Sending data...
✅ HTTP Response: 201
```

**Check Backend Console:**
- Should show "Sensor data received"
- Risk level: LOW

**Check Dashboard:**
- Go to http://localhost:3000
- See the data update in real-time!

---

### Scenario 2: Rising Temperature Warning

**Steps:**
1. Click DHT22 sensor
2. Set temperature to **10°C**
3. Keep other sensors normal

**Expected Behavior:**
- Serial shows: "🌡️ Temperature: 4.35°C (adjusted)"
- Backend classifies as MEDIUM risk
- Email alerts logged in backend console

**Demo Point:** "Temperature is rising, indicating accelerated glacier melt"

---

### Scenario 3: CRITICAL GLOF Alert

**Steps:**
1. **Temperature:** Set to **15°C** (DHT22)
2. **Water Level:** Set distance to **50cm** (HC-SR04) ← Water rising!
3. **Seismic:** Drag slider to **4000** ← High vibration!

**Expected Behavior:**
```
🚨 ALERT: CRITICAL GLOF Risk!
Temperature: 9.35°C
Seismic: 1.953 magnitude
Water Level: 450.00cm
📤 Sending CRITICAL alert...
```

**Backend Response:**
- 🚨 CRITICAL alert logged
- Emails sent to ALL recipients (PDMA, Emergency, Community)
- Dashboard shows RED alert

**Dashboard View:**
- http://localhost:3000
- Alert panel shows CRITICAL
- ML Insights predict high risk
- Map shows red indicator on glacier_lake_01

**Demo Points:**
- "Multiple factors detected simultaneously"
- "System correlates temperature + seismic + water level"
- "Automated alerts in 3 languages sent instantly"

---

## 🛠️ Troubleshooting

### Issue: "Wokwi license required"

**Solution:**
1. Go to https://wokwi.com/vscode
2. Sign in with GitHub
3. Copy license key
4. In VS Code: `F1` → "Wokwi: Request License"
5. Paste key

### Issue: "Failed to compile"

**Solution:**
Check you have the correct libraries. Add to `wokwi.toml`:
```toml
[env]
ARDUINO_BOARD = "esp32:esp32:esp32"
```

### Issue: "HTTP Error: -1" or "Connection refused"

**Solution:**
```bash
# 1. Check backend is running:
cd backend
npm run dev

# 2. Verify URL in code is:
const char* API_URL = "http://localhost:5001/api/sensor/data";

# 3. Test API manually:
curl http://localhost:5001/api/health
# Should return: {"status":"healthy"}
```

### Issue: Serial monitor not showing

**Solution:**
- Click "Serial Monitor" tab at bottom of VS Code
- Or press `F1` → "Wokwi: Show Serial Monitor"

### Issue: Simulation is slow

**Solution:**
Comment out deep sleep for faster demo:
```cpp
// In loop() function, replace:
esp_deep_sleep_start();

// With:
delay(10000); // 10 second delay instead
```

---

## 🎥 Recording the Demo

### Built-in Screen Recording:

**macOS:**
```bash
# Press Cmd+Shift+5 for screen recording
# Select VS Code window
# Click Record
```

**Windows:**
```bash
# Press Win+G for Game Bar
# Click Record button
```

### What to Show:

1. **VS Code with simulation running** (full screen)
2. **Serial monitor showing live data** (bottom panel)
3. **Changing sensor values** (click and adjust)
4. **Backend console** (in another terminal, split screen)
5. **Dashboard updating** (browser, split screen)

### Pro Tip:
Use VS Code's split view:
- Left: Simulation + Serial Monitor
- Right: Code editor
- Bottom: Integrated terminal showing backend logs

---

## ⚡ Performance Tips

### Speed up simulation:
```cpp
// Reduce sleep time for demo:
#define SLEEP_DURATION 10  // 10 seconds instead of 300

// Reduce samples:
#define SEISMIC_SAMPLES 20  // instead of 100
#define WATER_SAMPLES 2     // instead of 5
```

### Disable WiFi for offline demo:
```cpp
// In loop(), comment out WiFi code:
/*
if (connectWiFi()) {
  sendSensorData(temperature, seismicActivity, waterLevel);
  WiFi.disconnect(true);
}
*/

// Replace with:
Serial.println("📡 [DEMO MODE] Data ready to send");
delay(5000);
```

---

## 🎨 Customizing for Your Presentation

### Change Node Location:
```cpp
const char* NODE_ID = "hunza_glacier_01";
const char* LOCATION = "Hunza Valley, Gilgit-Baltistan";
const float ELEVATION = 3500.0;
```

### Add Your Team Name:
```cpp
Serial.println("═══════════════════════════════════════════");
Serial.println("   🏔️  PROJECT BARFANI - TEAM [YOUR NAME]");
Serial.println("   GLOF Early Warning System");
Serial.println("═══════════════════════════════════════════");
```

---

## 📊 Monitoring Dashboard While Simulating

### Split Screen Setup:

**Layout:**
```
┌─────────────────┬─────────────────┐
│                 │                 │
│   VS Code       │   Chrome        │
│   (Wokwi)       │   (Dashboard)   │
│                 │                 │
│   Serial        │   localhost:    │
│   Monitor       │   3000          │
│                 │                 │
├─────────────────┴─────────────────┤
│        Backend Terminal           │
│        (npm run dev logs)         │
└───────────────────────────────────┘
```

**Commands to set up:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Open browser
open http://localhost:3000

# VS Code: Start Wokwi simulation
# F1 → "Wokwi: Start Simulator"
```

---

## 🏆 Hackathon Presentation Flow

### 1. Introduction (30 seconds)
*Show VS Code with code visible*
- "Here's our ESP32 firmware running in Wokwi simulator"
- "You can see all 3 sensors in the circuit diagram"

### 2. Normal Operation (1 minute)
*Start simulation*
- Show serial monitor output
- Point out sensor readings
- Explain power management

### 3. Trigger Alert (1 minute)
*Adjust sensors to CRITICAL*
- Increase temperature
- Raise water level
- Add seismic activity
- Show CRITICAL alert in serial monitor

### 4. Show System Response (1 minute)
*Switch to backend/dashboard*
- Backend receives data
- Email alerts logged
- Dashboard updates with red alert

### 5. Q&A
*Keep simulation running in background*
- Judges can see live data continuing
- Can adjust sensors to answer questions

---

## 🔥 Advanced: Custom Sensors

Want to add more sensors? Edit `diagram.json`:

```json
{
  "type": "wokwi-led",
  "id": "led2",
  "top": 100,
  "left": -150,
  "attrs": { "color": "red" }
}
```

Connect in code:
```cpp
#define LED_WARNING 13
pinMode(LED_WARNING, OUTPUT);
digitalWrite(LED_WARNING, HIGH); // Turn on
```

---

## 📝 Checklist Before Demo

- [ ] Wokwi extension installed
- [ ] License activated
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] WiFi configured in code (Wokwi-GUEST)
- [ ] API URL set to localhost:5001
- [ ] Simulation starts without errors
- [ ] Serial monitor visible
- [ ] Can adjust all 3 sensors
- [ ] Backend receives data
- [ ] Dashboard updates in real-time
- [ ] Screen recording software ready
- [ ] Backup plan (screenshots/video)

---

## 🎓 Learning Resources

- [Wokwi VS Code Docs](https://docs.wokwi.com/vscode/getting-started)
- [ESP32 Arduino Core](https://docs.espressif.com/projects/arduino-esp32/en/latest/)
- [Wokwi Club (Support)](https://wokwi.com/club)

---

## 💡 Pro Tips

1. **Keep simulation simple during presentation**
   - Don't restart unnecessarily
   - Pre-set sensors before demo starts

2. **Have backup terminal open**
   - If WiFi fails, show offline mode
   - Serial monitor proves it's working

3. **Practice the timing**
   - Know exactly where to click
   - Rehearse sensor adjustments

4. **Prepare for questions:**
   - "Can you show the power consumption?" → Point to battery monitoring code
   - "How does it work offline?" → Explain deep sleep and data queuing
   - "Is this production-ready?" → Show error handling and power management

---

## 🚀 Ready to Impress!

You now have:
- ✅ Professional IDE simulation
- ✅ Real-time backend integration
- ✅ Interactive demo capabilities
- ✅ Production-quality code
- ✅ Complete documentation

**Your hackathon demo will be legendary!** 🏆

---

**Questions? Check:**
- `esp32_glof_sensor.ino` - The firmware code
- `diagram.json` - Circuit configuration
- `CIRCUIT_DOCUMENTATION.md` - Technical deep dive
- `HACKATHON_GUIDE.md` - Presentation strategy

*Good luck! 🏔️*
