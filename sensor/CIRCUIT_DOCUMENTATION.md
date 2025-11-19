# Project Barfani - IoT Sensor Node
## Circuit Documentation & Component Specifications

---

## Table of Contents
1. [Overview](#overview)
2. [Circuit Diagram](#circuit-diagram)
3. [Component Specifications](#component-specifications)
4. [Pin Connections](#pin-connections)
5. [Power Management](#power-management)
6. [Wokwi Simulation](#wokwi-simulation)
7. [Production Deployment](#production-deployment)

---

## Overview

The Project Barfani GLOF sensor node is a remote monitoring system designed to detect early warning signs of Glacial Lake Outburst Floods (GLOFs) in the Northern Pakistan region.

### Key Features:
- **Real-time monitoring** of temperature, seismic activity, and water levels
- **Solar-powered** with deep sleep for extended battery life
- **WiFi connectivity** for data transmission (can be upgraded to LoRaWAN)
- **Low-power operation** optimized for remote deployment
- **Robust design** for harsh glacial environments

---

## Circuit Diagram

### ASCII Circuit Diagram

```
                           ESP32-DevKit-V1
                    ┌───────────────────────────┐
                    │                           │
DHT22               │  D4 ←─── DHT22 Data       │
(Temperature)       │  3V3 ───→ DHT22 VCC       │
                    │  GND ───→ DHT22 GND       │
                    │                           │
HC-SR04             │  D5 ───→ TRIG             │
(Water Level)       │  D18 ←── ECHO             │
                    │  VIN ───→ VCC             │
                    │  GND ───→ GND             │
                    │                           │
SW-420 (Simulated   │  D34 ←── Analog Signal    │
with Potentiometer) │  3V3 ───→ VCC             │
                    │  GND ───→ GND             │
                    │                           │
Status LED          │  D2 ───→ LED (via 220Ω)  │
                    │  GND ───→ LED Cathode     │
                    │                           │
Battery Monitor     │  D35 ←── Battery Voltage  │
Solar Monitor       │  D32 ←── Solar Voltage    │
                    │                           │
                    └───────────────────────────┘
```

### Detailed Connection Table

| Component | ESP32 Pin | Function | Notes |
|-----------|-----------|----------|-------|
| DHT22 | D4 (GPIO 4) | Data | Temperature & Humidity |
| DHT22 | 3V3 | Power | 3.3V supply |
| DHT22 | GND | Ground | Common ground |
| HC-SR04 | D5 (GPIO 5) | Trigger | Ultrasonic trigger pulse |
| HC-SR04 | D18 (GPIO 18) | Echo | Echo return signal |
| HC-SR04 | VIN (5V) | Power | 5V required |
| HC-SR04 | GND | Ground | Common ground |
| Seismic (Analog) | D34 (ADC1_CH6) | Analog Input | 0-3.3V |
| Seismic | 3V3 | Power | 3.3V supply |
| Seismic | GND | Ground | Common ground |
| Status LED | D2 (GPIO 2) | Digital Out | Via 220Ω resistor |
| Battery Monitor | D35 (ADC1_CH7) | Analog Input | Voltage divider |
| Solar Monitor | D32 (ADC1_CH4) | Analog Input | Voltage divider |

---

## Component Specifications

### 1. ESP32-DevKit-V1

**Purpose:** Main microcontroller

**Specifications:**
- CPU: Dual-core Xtensa LX6 @ 240MHz
- RAM: 520 KB SRAM
- Flash: 4 MB
- WiFi: 802.11 b/g/n
- Bluetooth: BLE 4.2
- Operating Voltage: 3.3V
- Input Voltage: 5V via USB or VIN (7-12V)
- Deep Sleep Current: 10μA
- Active Current: ~80mA (WiFi on), ~20mA (WiFi off)
- Operating Temperature: -40°C to +85°C
- GPIO Pins: 30+
- ADC: 12-bit, 18 channels

**Why ESP32:**
- Built-in WiFi for data transmission
- Ultra-low power deep sleep mode
- Multiple ADC channels for sensors
- RTC memory for persistent data
- Perfect for remote, battery-powered applications

**Cost:** ~$5-7 USD

---

### 2. DHT22 (AM2302) Temperature & Humidity Sensor

**Purpose:** Measure ambient temperature for GLOF risk assessment

**Specifications:**
- Temperature Range: -40°C to +80°C
- Temperature Accuracy: ±0.5°C
- Humidity Range: 0-100% RH
- Humidity Accuracy: ±2-5% RH
- Resolution: 0.1°C, 0.1% RH
- Operating Voltage: 3.3-6V DC
- Operating Current: 1-1.5mA (measuring), 40-50μA (standby)
- Sampling Rate: 0.5 Hz (once every 2 seconds)
- Digital Interface: Single-wire bidirectional communication
- Body Size: 15.1mm x 25mm x 7.7mm

**Why DHT22:**
- Wide temperature range suitable for glacial environments
- Low power consumption
- Digital output (no ADC needed)
- Proven reliability in outdoor applications

**GLOF Relevance:**
- Rising temperatures indicate accelerated glacier melt
- Critical threshold: Sustained temperatures above 10°C

**Cost:** ~$3-5 USD

---

### 3. HC-SR04 Ultrasonic Distance Sensor

**Purpose:** Measure water level changes in glacial lake

**Specifications:**
- Sensing Range: 2cm - 400cm
- Accuracy: ±3mm
- Resolution: 0.3cm
- Operating Voltage: 5V DC
- Operating Current: 15mA
- Frequency: 40 kHz
- Trigger Pulse: 10μs TTL pulse
- Echo Pulse: Proportional to distance
- Beam Angle: 15°
- Operating Temperature: -15°C to +70°C

**Why HC-SR04:**
- Non-contact measurement
- Good range for lake monitoring
- Weather-resistant
- Low cost

**GLOF Relevance:**
- Rapid water level rise is key GLOF indicator
- Critical threshold: >20% increase in 1 hour

**Deployment Notes:**
- Mount above maximum expected water level
- Weatherproof enclosure required
- Angle sensor downward to avoid obstacles

**Cost:** ~$2-3 USD

---

### 4. SW-420 Vibration/Seismic Sensor

**Purpose:** Detect seismic activity and glacier movement

**Specifications:**
- Sensor Type: Normally Closed Switch
- Operating Voltage: 3.3-5V DC
- Operating Current: <1mA
- Output: Digital (DO) + Analog (AO)
- Sensitivity: Adjustable via potentiometer
- Detection Range: Vibration/shock detection
- Response Time: <1ms
- Operating Temperature: -10°C to +70°C

**In Wokwi Simulation:**
- Simulated using a potentiometer (0-4095 ADC values)
- Turning the knob simulates vibration intensity

**Why SW-420:**
- Sensitive to small vibrations
- Both analog and digital output
- Low power consumption
- Adjustable sensitivity

**GLOF Relevance:**
- Ice cracking and glacier movement produce seismic signals
- Earthquake activity can trigger GLOFs
- Critical threshold: Sustained activity >0.5 magnitude

**Production Alternative:**
- For production, consider:
  - ADXL345 (3-axis accelerometer)
  - MPU-6050 (gyroscope + accelerometer)
  - Geophone sensors for true seismic detection

**Cost:** ~$1-2 USD

---

### 5. Solar Power System

**Components:**
- **Solar Panel:** 6V 2W monocrystalline
- **Charge Controller:** TP4056 Li-ion charger
- **Battery:** 18650 Li-ion 3.7V 3000mAh
- **Voltage Regulators:** LM7805 (5V), LM1117 (3.3V)

**Specifications:**

**Solar Panel:**
- Voltage: 6V
- Power: 2W
- Current: ~330mA (peak)
- Size: 110mm x 60mm
- Efficiency: ~17%

**Battery:**
- Type: Li-ion 18650
- Voltage: 3.7V nominal (3.0-4.2V)
- Capacity: 3000mAh
- Charge Cycles: 500+
- Operating Temperature: -20°C to +60°C

**Charge Controller (TP4056):**
- Input: 4.5-8V
- Output: 4.2V (charging)
- Charge Current: 1A (adjustable)
- Over-charge Protection: Yes
- Over-discharge Protection: Yes (with DW01A)

**Cost:** ~$10-15 USD (complete system)

---

### 6. Additional Components

| Component | Specification | Purpose | Cost |
|-----------|---------------|---------|------|
| Status LED | Green, 3mm | Visual indicator | $0.10 |
| Resistor (LED) | 220Ω, 1/4W | Current limiting | $0.05 |
| Voltage Divider (x2) | 100kΩ resistors | Battery/solar monitoring | $0.10 |
| Weatherproof Enclosure | IP66 rated, 200x150x70mm | Protection | $8-10 |
| Antenna (WiFi) | 2.4GHz external | Signal boost | $2-3 |
| Mounting Hardware | Stainless steel | Outdoor installation | $5 |

**Total Component Cost:** ~$40-50 USD per node

---

## Pin Connections

### ESP32 Pinout Reference

```
                  ESP32-DevKit-V1
         ╔══════════════════════════════╗
         ║                              ║
     3V3 ║ •                          • ║ GND
      EN ║ •                          • ║ D23 (MOSI)
    VP36 ║ •                          • ║ D22 (SCL)
    VN39 ║ •                          • ║ TX0
     D34 ║ • ← Seismic Sensor         • ║ RX0
     D35 ║ • ← Battery Monitor        • ║ D21 (SDA)
     D32 ║ • ← Solar Monitor          • ║ GND
     D33 ║ •                          • ║ D19 (MISO)
     D25 ║ •                          • ║ D18 ← Echo
     D26 ║ •                          • ║ D5  → Trigger
     D27 ║ •                          • ║ TX2
     D14 ║ •                          • ║ RX2
     D12 ║ •                          • ║ D4  ← DHT22
     GND ║ •                          • ║ D2  → LED
     D13 ║ •                          • ║ D15
      D9 ║ •                          • ║ GND
     D10 ║ •                          • ║ VIN (5V)
     D11 ║ •                          • ║
     CMD ║ •                          • ║
         ║                              ║
         ╚══════════════════════════════╝
```

### Critical Pin Notes:

**ADC Pins (Analog Input):**
- Use ADC1 pins (D32-D39) when WiFi is enabled
- ADC2 pins (D0, D2, D4, D12-D15, D25-D27) conflict with WiFi
- We use D34 (seismic), D35 (battery), D32 (solar)

**Special Pins:**
- D0: Boot mode (must be HIGH at boot)
- D2: Built-in LED, safe for output
- D34-D39: Input only (no pull-up/down)

---

## Power Management

### Power Consumption Analysis

| Mode | Current Draw | Duration | Energy |
|------|--------------|----------|--------|
| **Active (WiFi On)** | 80mA | 30s | 0.67mAh |
| **Sensor Reading** | 25mA | 10s | 0.07mAh |
| **Deep Sleep** | 10μA | 5 minutes | 0.83μAh |
| **Total per Cycle** | - | 5.67 min | 0.74mAh |

**Daily Energy Budget:**
- Cycles per day: 288 (every 5 minutes)
- Daily consumption: 288 × 0.74mAh = **213mAh/day**
- With 3000mAh battery: **14+ days** without solar
- With 2W solar (~250mAh/day in winter): **Indefinite operation**

### Deep Sleep Implementation

```cpp
// Configure wake-up timer
esp_sleep_enable_timer_wakeup(SLEEP_DURATION * 1000000ULL);

// Enter deep sleep
esp_deep_sleep_start();
```

**What's preserved:**
- RTC memory (8KB)
- Boot count
- Last sensor readings

**What's reset:**
- WiFi connection
- RAM variables
- Peripheral states

### Power Saving Strategies

1. **WiFi Management**
   - Connect only when sending data
   - Disconnect immediately after
   - Saved: ~50mA during sleep prep

2. **Sensor Duty Cycling**
   - DHT22: Read once per cycle (already limited to 0.5Hz)
   - HC-SR04: 5 samples averaged
   - Seismic: 100 quick samples

3. **Adaptive Sleep**
   - Normal: 5 minutes
   - Low battery: 20 minutes
   - Critical battery: 4 hours

4. **Brown-out Detection**
   - Monitor battery voltage
   - Shutdown before damage (<3.0V)

---

## Wokwi Simulation

### How to Run the Simulation

1. **Open Wokwi:**
   - Go to https://wokwi.com
   - Click "New Project" → "ESP32"

2. **Load Project Files:**
   - Copy `esp32_glof_sensor.ino` to the main sketch
   - Copy `diagram.json` to replace the circuit
   - Install ArduinoJson library (if needed)

3. **Simulate WiFi Connection:**
   ```cpp
   // In code, update these lines:
   const char* WIFI_SSID = "Wokwi-GUEST";
   const char* WIFI_PASSWORD = "";
   const char* API_URL = "http://your-ngrok-url/api/sensor/data";
   ```

4. **Run Simulation:**
   - Click "Start Simulation" (green play button)
   - Monitor serial output (baud rate: 115200)
   - Adjust sensors to simulate different conditions

### Simulating GLOF Conditions

**Normal Conditions:**
- Temperature: -5°C to 0°C
- Seismic: Potentiometer at 512 (~0.25 magnitude)
- Water Level: Steady distance (~200cm)

**High Risk Conditions:**
- Temperature: 10°C+ (adjust DHT22 settings)
- Seismic: Potentiometer at 3000+ (~1.5 magnitude)
- Water Level: Decrease distance to 100cm (rising water)

**Critical GLOF Alert:**
- Temperature: 15°C
- Seismic: Maximum potentiometer (4095, ~2.0 magnitude)
- Water Level: Rapid change from 200cm to 50cm

### Wokwi Limitations

- **No Deep Sleep:** Wokwi doesn't simulate esp_deep_sleep()
  - Workaround: Use delay() instead
  - Comment out deep sleep lines for simulation

- **No Real WiFi:** Wokwi simulates WiFi
  - May need ngrok or public URL for API
  - Can simulate offline mode

- **No Battery Simulation:** Battery/solar monitoring won't show real values
  - Returns simulated ADC readings

---

## Production Deployment

### Hardware Upgrades for Field Deployment

1. **LoRaWAN Connectivity** (instead of WiFi)
   - Module: RFM95W (868/915 MHz)
   - Range: 10-15 km line-of-sight
   - Power: <50mA transmit, <1μA sleep
   - Gateway: Single gateway per valley

2. **Industrial Sensors**
   - Temperature: DS18B20 (-55 to +125°C)
   - Seismic: Geophone or ADXL345
   - Water Level: Ultrasonic or pressure sensor

3. **Weatherproof Enclosure**
   - IP66 rated minimum
   - UV-resistant polycarbonate
   - Cable glands for wires
   - Desiccant packs

4. **Extended Solar System**
   - 10W solar panel
   - 10,000mAh battery pack
   - MPPT charge controller

### Firmware for LoRaWAN

```cpp
#include <LoRa.h>

// LoRaWAN Configuration
#define LORA_FREQUENCY 868E6  // or 915E6 for US
#define LORA_TX_POWER 20      // dBm
#define LORA_SPREADING_FACTOR 7

void setupLoRa() {
  LoRa.begin(LORA_FREQUENCY);
  LoRa.setTxPower(LORA_TX_POWER);
  LoRa.setSpreadingFactor(LORA_SPREADING_FACTOR);
}

void sendDataLoRa(String jsonData) {
  LoRa.beginPacket();
  LoRa.print(jsonData);
  LoRa.endPacket();
}
```

### Installation Locations

**Optimal Placement:**
- 100-300m from glacial lake shore
- Elevated position (avoid avalanche zones)
- Clear line of sight to gateway
- Solar panel facing south
- Secure mounting to bedrock

**Environmental Considerations:**
- Extreme cold (-40°C)
- High UV exposure
- Snow/ice accumulation
- Wind loading
- Avalanche risk

### Maintenance Schedule

- **Monthly:** Visual inspection (remote camera)
- **Quarterly:** Battery check
- **Annually:** Full sensor calibration
- **As needed:** Snow/ice removal

---

## Bill of Materials (BOM)

### Complete Sensor Node

| Item | Part Number | Qty | Unit Cost | Total |
|------|-------------|-----|-----------|-------|
| ESP32-DevKit-V1 | ESP32-WROOM-32 | 1 | $6.00 | $6.00 |
| DHT22 | AM2302 | 1 | $4.00 | $4.00 |
| HC-SR04 | HC-SR04 | 1 | $2.50 | $2.50 |
| SW-420 | SW-420 | 1 | $1.50 | $1.50 |
| Solar Panel | 6V 2W | 1 | $5.00 | $5.00 |
| Li-ion Battery | 18650 3000mAh | 2 | $3.00 | $6.00 |
| Charge Controller | TP4056 + DW01A | 1 | $1.00 | $1.00 |
| Enclosure | IP66 200x150x70mm | 1 | $10.00 | $10.00 |
| LED + Resistors | - | - | - | $0.50 |
| Wiring & Connectors | - | - | - | $3.00 |
| Mounting Hardware | - | - | - | $5.00 |
| **TOTAL PER NODE** | | | | **$44.50** |

### For Production (per 10 nodes):

| Item | Cost per 10 Units | Notes |
|------|-------------------|-------|
| Components | $445 | Bulk discount available |
| LoRaWAN Gateway | $150 | Shared by all nodes |
| Shipping & Import | $50 | From China |
| Assembly Labor | $100 | Local assembly |
| Testing & QA | $50 | Pre-deployment |
| **TOTAL** | **$795** | **~$80/node** |

---

## Compliance & Certifications

### For Pakistan Deployment:

1. **PTA (Pakistan Telecommunication Authority)**
   - Frequency allocation for LoRa
   - Type approval for radio devices

2. **PSQCA (Pakistan Standards & Quality Control Authority)**
   - Product safety standards
   - EMC compliance

3. **Environmental**
   - IP66 ingress protection
   - Operating temperature range
   - RoHS compliance (lead-free)

---

## References & Resources

### Datasheets:
1. [ESP32 Technical Reference](https://www.espressif.com/sites/default/files/documentation/esp32_technical_reference_manual_en.pdf)
2. [DHT22 Datasheet](https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf)
3. [HC-SR04 Datasheet](https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf)

### Additional Reading:
- [ESP32 Deep Sleep Guide](https://randomnerdtutorials.com/esp32-deep-sleep-arduino-ide-wake-up-sources/)
- [LoRaWAN in Pakistan](https://www.thethingsnetwork.org/country/pakistan/)
- [GLOF Risk Assessment](https://www.preventionweb.net/publications/view/glacial-lake-outburst-floods-pakistan)

---

**Document Version:** 1.0
**Last Updated:** 2025
**Prepared by:** Project Barfani Team
**Contact:** barfani-team@example.com

