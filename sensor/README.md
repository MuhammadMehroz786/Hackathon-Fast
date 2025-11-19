# Project Barfani - ESP32 Sensor Simulation

## Wokwi Setup Instructions

### Option 1: Quick Start (Copy-Paste)

1. Go to [Wokwi.com](https://wokwi.com/projects/new/esp32)
2. Copy the code from `esp32_glacier_monitor.ino`
3. Paste it into the Wokwi code editor
4. Update line 16 with your backend URL:
   ```cpp
   const char* serverUrl = "http://your-backend-url/api/sensor/data";
   ```
5. Click "Start Simulation"

### Option 2: Full Circuit Diagram

1. Create a new ESP32 project on Wokwi
2. Add the following components:
   - ESP32 DevKit v1
   - DHT22 Temperature & Humidity Sensor
   - HC-SR04 Ultrasonic Distance Sensor
   - LED (for status indication)
   - 220Ω Resistor

3. Wire the components:
   - **DHT22:**
     - VCC → ESP32 3.3V
     - DATA → GPIO 4
     - GND → GND

   - **HC-SR04:**
     - VCC → ESP32 5V
     - TRIG → GPIO 5
     - ECHO → GPIO 18
     - GND → GND

   - **LED:**
     - Anode → 220Ω Resistor → GPIO 2
     - Cathode → GND

### Configuration

For different sensor nodes, change the `nodeId` variable:
```cpp
const char* nodeId = "glacier_lake_01";  // Options: glacier_lake_01, 02, 03
```

### Simulation Scenarios

The code includes built-in simulation modes:

**Normal Mode (readings 0-20):**
- Temperature: -10°C ± 2°C
- Seismic: 0.2 ± 0.1
- Water Level: 250cm ± 5cm

**Warning Mode (readings 20-40):**
- Temperature: Gradually increasing
- Seismic: Occasional spikes
- Water Level: Rising trend

**Critical Mode (readings 40+):**
- All sensors showing dangerous levels
- Will trigger CRITICAL alerts in backend

### Troubleshooting

**"HTTP Error: -1"**
- Update `serverUrl` with your actual backend URL
- Make sure backend is running and accessible
- For local testing, use ngrok to expose localhost

**No WiFi Connection:**
- Wokwi uses built-in WiFi simulation
- No action needed, should connect automatically

**No Data Appearing in Dashboard:**
- Check backend logs for incoming requests
- Verify API endpoint is correct
- Check CORS settings in backend

## Libraries Required

For Wokwi, these are automatically available:
- WiFi.h (ESP32 built-in)
- HTTPClient.h (ESP32 built-in)
- ArduinoJson (add via Library Manager if needed)

## Serial Monitor Output

Watch the Serial Monitor in Wokwi to see:
- WiFi connection status
- Sensor readings
- HTTP response codes
- Alert notifications
