# Project Barfani - ESP32 GLOF Sensor Simulation

## Wokwi Online Simulation - Quick Start Guide

This is a **complete virtual prototype** of the IoT sensor node for the GLOF early warning system, designed for **Track 1: IoT Sensor Simulation** of the hackathon.

---

## 🚀 How to Run the Simulation

### Option 1: Wokwi Online (Recommended for Presentation)

1. **Go to Wokwi:**
   - Open [https://wokwi.com](https://wokwi.com)
   - Click "Sign in" (free account)

2. **Create New ESP32 Project:**
   - Click "+ New Project"
   - Select "Arduino ESP32"

3. **Load the Code:**
   - Delete the default code
   - Copy **all** content from `esp32_glof_sensor.ino`
   - Paste into the Wokwi editor

4. **Load the Circuit:**
   - Click the "diagram.json" tab (bottom of editor)
   - Delete existing content
   - Copy **all** content from our `diagram.json`
   - Paste into Wokwi

5. **Configure WiFi (for demo):**
   ```cpp
   // Update these lines in the code:
   const char* WIFI_SSID = "Wokwi-GUEST";
   const char* WIFI_PASSWORD = "";
   ```

6. **Start the Simulation:**
   - Click the green "▶ Start Simulation" button
   - Watch the serial monitor (bottom panel)
   - See sensor readings in real-time!

---

## 🎮 Interacting with the Simulation

### Simulating Different Weather Conditions

**1. Temperature Sensor (DHT22):**
- Click the DHT22 sensor in the diagram
- In the properties panel, adjust "Temperature"
- Try these scenarios:
  - **Normal:** -5°C
  - **Warning:** 5°C
  - **Critical:** 15°C

**2. Water Level (HC-SR04):**
- Click the HC-SR04 sensor
- Adjust "Distance" (in cm)
- Distance = how far sensor is from water
- Try these scenarios:
  - **Normal:** 200cm (low water)
  - **Rising:** 100cm (water rising)
  - **GLOF Alert:** 50cm (critical level)

**3. Seismic Activity (Potentiometer):**
- The slider potentiometer simulates the vibration sensor
- Drag the slider to change values (0-4095)
- Try these scenarios:
  - **No Activity:** 512 (center)
  - **Moderate:** 2000
  - **High Seismic:** 4000

**4. Status LED:**
- Watch the green LED blink
- Blink patterns:
  - **3 rapid blinks:** WiFi connected
  - **5 fast blinks:** Error/WiFi failed
  - **1 slow blink:** Going to sleep

---

## 📊 Serial Monitor Output

Watch the serial monitor (bottom panel) for real-time output:

```
═══════════════════════════════════════════
   🏔️  PROJECT BARFANI - GLOF SENSOR
   Glacier Monitoring & Early Warning
═══════════════════════════════════════════
Node ID: glacier_lake_01
Location: Hunza Valley, GB
Elevation: 3400m
Boot count: 1
═══════════════════════════════════════════

🔋 Battery: 3.85V | ☀️ Solar: 5.20V
📡 Connecting to WiFi...
✅ WiFi connected!
IP: 192.168.1.100

🔄 Starting sensor reading cycle...

🌡️  Temperature: -5.65°C (adjusted for 3400m elevation)
📊 Seismic Activity: 0.251 magnitude (variance: 512)
💧 Water Level: 300.00cm (distance: 200.00cm)

📊 ══ SENSOR READINGS ══
Temperature: -5.65°C
Seismic: 0.251 magnitude
Water Level: 300.00cm
═════════════════════════

📤 Sending data:
{"node_id":"glacier_lake_01",...}
✅ HTTP Response: 201

⏱️  Cycle completed in 15 seconds
😴 Entering deep sleep for 300 seconds...
```

---

## 🎯 Hackathon Demonstration Scenarios

### Scenario 1: Normal Glacier Monitoring

**Setup:**
- Temperature: -10°C
- Water Level Distance: 250cm
- Seismic: Slider at 512 (center)

**Expected Output:**
- All readings normal
- Data sent successfully
- Goes to sleep for 5 minutes
- LED blinks 3 times

**Demonstrates:**
- System working in normal conditions
- Power saving (deep sleep)
- Regular monitoring cycle

---

### Scenario 2: Temperature Warning

**Setup:**
- Temperature: 10°C ← **Increase this**
- Water Level Distance: 200cm
- Seismic: Slider at 512

**Expected Output:**
- Temperature above threshold
- Backend classifies as MEDIUM or HIGH risk
- Alert email triggered (check backend console)

**Demonstrates:**
- Temperature threshold detection
- Glacier melt risk assessment
- Alert escalation

---

### Scenario 3: Critical GLOF Risk

**Setup:**
- Temperature: 15°C ← **Maximum**
- Water Level Distance: 50cm ← **Decrease (water rising!)**
- Seismic: Slider at 4000 ← **Move right (vibration!)**

**Expected Output:**
- **CRITICAL** risk level
- Multiple thresholds exceeded
- Emails sent to all authorities (PDMA, Emergency, Community)
- Dashboard shows red alert

**Demonstrates:**
- Multi-parameter correlation
- Emergency response activation
- Complete system integration

---

### Scenario 4: Low Battery Mode

**Setup:**
- Edit code to simulate low battery:
  ```cpp
  // In readBatteryVoltage() function, return a low value:
  return 3.2; // Low battery
  ```

**Expected Output:**
- "⚠️ Low battery - Power saving mode" message
- Still operates but conserves power
- LED blinks 3 times (warning pattern)

**Demonstrates:**
- Power management
- Solar charging awareness
- Graceful degradation

---

## 🔧 Troubleshooting

### Issue: "Failed to read temperature"
- **Cause:** DHT22 not connected properly in diagram
- **Fix:** Check diagram.json connections

### Issue: "WiFi connection failed"
- **Cause:** Wokwi WiFi simulation
- **Fix:** Update WiFi credentials to "Wokwi-GUEST" (no password)
- **Alternative:** Comment out WiFi code for offline demo

### Issue: "HTTP Error: -1"
- **Cause:** Backend API not running or URL incorrect
- **Fix:**
  - Start your backend (`npm run dev` in backend folder)
  - Or comment out HTTP code to see sensor readings only

### Issue: Simulation is slow
- **Cause:** Deep sleep simulation
- **Fix:** Comment out the deep sleep line:
  ```cpp
  // esp_deep_sleep_start(); // Comment this out
  ```
  Replace with:
  ```cpp
  delay(10000); // Wait 10 seconds instead
  ```

---

## 📚 Required Libraries

Wokwi includes these libraries by default:
- ✅ WiFi (ESP32 built-in)
- ✅ HTTPClient (ESP32 built-in)
- ✅ DHT sensor library
- ⚠️ **ArduinoJson** - You may need to add this

To add ArduinoJson in Wokwi:
1. Click "Library Manager" (book icon)
2. Search for "ArduinoJson"
3. Click "Add to Project"

---

## 🎨 Customization for Your Presentation

### Change Node ID and Location:
```cpp
const char* NODE_ID = "your_glacier_name";
const char* LOCATION = "Your Location, GB";
const float ELEVATION = 3500.0; // your elevation
```

### Change Sleep Duration (for faster demo):
```cpp
#define SLEEP_DURATION 30  // 30 seconds instead of 300
```

### Disable WiFi for Offline Demo:
```cpp
// Comment out this entire block:
// if (connectWiFi()) {
//   sendSensorData(...);
//   WiFi.disconnect(true);
// }

// Add this instead:
Serial.println("📡 [DEMO MODE] Would send data to backend");
delay(5000);
```

---

## 🏆 Hackathon Judging Points

This simulation demonstrates:

### ✅ Track 1 Requirements:

1. **Complete Virtual Prototype**
   - ESP32 microcontroller simulation
   - All 3 sensors integrated (DHT22, HC-SR04, SW-420)
   - Runs live in browser

2. **Realistic Data Patterns**
   - Temperature: -20°C to +15°C range
   - Seismic: Variable magnitude readings
   - Water Level: Gradual and rapid changes

3. **Live Demonstration**
   - Interactive sensor controls
   - Real-time serial output
   - Immediate response to changes

4. **Circuit Diagrams**
   - Complete wiring diagram in diagram.json
   - Component specifications in CIRCUIT_DOCUMENTATION.md
   - Pin connections documented

5. **Power Management**
   - Deep sleep implementation
   - Battery voltage monitoring
   - Solar charging simulation
   - Power consumption calculations

6. **Network Communication**
   - WiFi data transmission
   - HTTP POST to backend API
   - JSON payload formatting
   - LoRaWAN implementation documented

---

## 📸 Screenshots for Presentation

Take these screenshots during demo:

1. **Wokwi Circuit View**
   - Shows all components connected
   - Clean, professional diagram

2. **Serial Monitor - Normal Operation**
   - Steady readings
   - Successful data transmission

3. **Serial Monitor - GLOF Alert**
   - Critical values
   - Alert activation

4. **Backend Dashboard**
   - Real-time data received
   - Email alerts triggered
   - Risk assessment displayed

---

## 🌐 Connecting to Your Backend

### Local Development:

1. **Get your computer's IP address:**
   ```bash
   # macOS/Linux:
   ifconfig | grep "inet "

   # Windows:
   ipconfig
   ```

2. **Update API URL in code:**
   ```cpp
   const char* API_URL = "http://192.168.1.100:5001/api/sensor/data";
   //                            ↑↑↑↑ Your IP here
   ```

3. **Ensure backend is running:**
   ```bash
   cd backend
   npm run dev
   ```

### Using ngrok (for cloud testing):

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Expose your local backend:**
   ```bash
   ngrok http 5001
   ```

3. **Copy the ngrok URL:**
   ```
   Forwarding: https://abc123.ngrok.io → localhost:5001
   ```

4. **Update code:**
   ```cpp
   const char* API_URL = "https://abc123.ngrok.io/api/sensor/data";
   ```

---

## 🔗 Useful Links

- **Wokwi Documentation:** https://docs.wokwi.com
- **ESP32 Pinout:** https://randomnerdtutorials.com/esp32-pinout-reference-gpios/
- **DHT22 Library:** https://github.com/adafruit/DHT-sensor-library
- **ArduinoJson:** https://arduinojson.org

---

## 💡 Pro Tips for Judges

1. **Show the Serial Monitor**
   - Demonstrates real-time operation
   - Shows all sensor readings
   - Proves data transmission

2. **Interact Live**
   - Change temperature during presentation
   - Simulate GLOF conditions on the fly
   - Show immediate system response

3. **Explain Power Efficiency**
   - Point out deep sleep in code
   - Show battery monitoring
   - Explain 14+ days battery life

4. **Connect to Live Backend**
   - Show data appearing in dashboard
   - Trigger real email alerts
   - Demonstrate end-to-end system

5. **Have Backup Plan**
   - Pre-record a video of simulation
   - Have screenshots ready
   - Test internet connection beforehand

---

## ✨ What Makes This Special

**For Judges:**
- ✅ **Live, interactive simulation** (not just slides!)
- ✅ **Professional firmware** with error handling
- ✅ **Production-ready code** with sleep modes
- ✅ **Complete documentation** with circuit diagrams
- ✅ **Real sensor integration** (not theoretical)
- ✅ **Power optimization** for remote deployment
- ✅ **Scalable architecture** (ready for LoRaWAN)

---

**Good luck with your hackathon presentation!** 🏔️🏆

*For questions or support, contact the Project Barfani team.*
