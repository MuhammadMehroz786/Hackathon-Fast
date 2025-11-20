# Project Barfani - Technical Architecture

## System Overview

Project Barfani is a complete IoT-based Glacial Lake Outburst Flood (GLOF) early warning system designed for deployment in the extreme terrain of Northern Pakistan's glacier regions.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         PROJECT BARFANI ARCHITECTURE                          │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│   FIELD DEPLOYMENT      │
│   (Glacier Sites)       │
└─────────────────────────┘
          │
          ├──> Sensor Node 1: Hunza Valley (2,438m)
          │    ├─ ESP32-WROOM-32
          │    ├─ DS18B20 (Temperature: -55°C to +125°C)
          │    ├─ ADXL345 (Seismic: ±16g accelerometer)
          │    ├─ HC-SR04 (Water Level: 2-400cm ultrasonic)
          │    ├─ Solar Panel (6V 2W) + Li-Ion Battery (3.7V 3000mAh)
          │    └─ LoRaWAN + WiFi Communication
          │
          ├──> Sensor Node 2: Chitral (1,498m)
          │    └─ [Same hardware configuration]
          │
          └──> Sensor Node 3: Skardu (2,230m)
               └─ [Same hardware configuration]
                      │
                      │ Data Transmission
                      │ (Every 2 minutes)
                      │ WiFi/LoRaWAN (915MHz)
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NETWORK LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  LoRaWAN Gateway (915MHz)  │  WiFi Access Point  │  Mobile Network (4G)    │
└─────────────────────────────────────────────────────────────────────────────┘
                      │
                      │ Internet/VPN
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVER (Cloud)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Node.js/Express API Server (Port 5001)                                   │
│  • Real-time Data Ingestion Service                                         │
│  • WebSocket Server (Socket.IO for live updates)                            │
│  • In-Memory Data Store + Firebase (optional)                               │
└─────────────────────────────────────────────────────────────────────────────┘
                      │
                      ├──────────────┬──────────────┬──────────────┐
                      ▼              ▼              ▼              ▼
        ┌─────────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────┐
        │  ML/AI ENGINE   │ │ ALERT ENGINE │ │  DATA API  │ │ WEATHER  │
        │                 │ │              │ │            │ │   API    │
        │ • Z-Score       │ │ • Risk Calc  │ │ • REST     │ │ Open-    │
        │   Anomaly       │ │ • Thresholds │ │ • Cache    │ │ Meteo    │
        │ • Linear Reg    │ │ • Multi-     │ │ • Compress │ │          │
        │ • Predictions   │ │   factor     │ │            │ │          │
        │ • 6hr Forecast  │ │ • Correlate  │ │            │ │          │
        └─────────────────┘ └──────────────┘ └────────────┘ └──────────┘
                      │              │
                      └──────┬───────┘
                             │
                   Risk Assessment
                   (LOW/MEDIUM/HIGH/CRITICAL)
                             │
                             ▼
        ┌────────────────────────────────────────────┐
        │         NOTIFICATION SYSTEM                │
        ├────────────────────────────────────────────┤
        │  • Email Alerts (Nodemailer + Gmail)      │
        │  • SMS Alerts (Twilio - future)           │
        │  • Push Notifications (future)            │
        │  • Siren Activation (GPIO control)        │
        └────────────────────────────────────────────┘
                             │
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND APPLICATIONS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────┐  ┌──────────────────────────┐   │
│  │   PDMA DASHBOARD (Next.js 14)         │  │  IoT HARDWARE DASHBOARD  │   │
│  │   (Port 3000)                         │  │  (Port 8080)             │   │
│  ├───────────────────────────────────────┤  ├──────────────────────────┤   │
│  │ • Real-time Sensor Map                │  │ • Circuit Diagrams       │   │
│  │ • Live Data Charts (Temp/Seismic/     │  │ • Component Specs        │   │
│  │   Water Level)                        │  │ • Live Sensor Readings   │   │
│  │ • Alert Panel (Risk Levels)           │  │ • Power Management       │   │
│  │ • ML Risk Analysis                    │  │ • Hardware Status        │   │
│  │ • Multi-language (EN/UR/BS)           │  │ • Virtual Simulation     │   │
│  │ • Test Mode / Real-time Mode          │  │                          │   │
│  │ • WebSocket Live Updates              │  │                          │   │
│  └───────────────────────────────────────┘  └──────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                             │
                             │ Alerts & Updates
                             │
                             ▼
        ┌────────────────────────────────────────────┐
        │         END USERS                          │
        ├────────────────────────────────────────────┤
        │ • PDMA Officials (Web Dashboard)          │
        │ • Village Communities (SMS/Mobile)        │
        │ • Emergency Responders (Email Alerts)     │
        │ • Researchers (Data API Access)           │
        └────────────────────────────────────────────┘
```

## Data Flow Pipeline

```
Sensor Reading → ESP32 Processing → Power Management → Data Transmission
                                          ↓
                              ┌───────────────────────┐
                              │   Deep Sleep Mode     │
                              │   (Power Saving)      │
                              └───────────────────────┘
                                          ↓
                              ┌───────────────────────┐
                              │  Wake Every 2 Minutes │
                              └───────────────────────┘
                                          ↓
                              ┌───────────────────────┐
                              │  Read All Sensors     │
                              │  • Temperature        │
                              │  • Seismic Activity   │
                              │  • Water Level        │
                              │  • Battery Status     │
                              └───────────────────────┘
                                          ↓
                              ┌───────────────────────┐
                              │  Transmit via WiFi    │
                              │  or LoRaWAN (915MHz)  │
                              └───────────────────────┘
                                          ↓
                              ┌───────────────────────┐
                              │   Backend Receives    │
                              │   POST /api/sensor/   │
                              │   data                │
                              └───────────────────────┘
                                          ↓
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
        ┌────────────────────┐                      ┌────────────────────┐
        │   ML ANALYSIS      │                      │  ALERT ANALYSIS    │
        ├────────────────────┤                      ├────────────────────┤
        │ 1. Calculate       │                      │ 1. Check Temp      │
        │    Z-scores        │                      │    > 10°C          │
        │ 2. Detect          │                      │ 2. Check Seismic   │
        │    Anomalies       │                      │    > 0.5g          │
        │ 3. Linear          │                      │ 3. Check Water     │
        │    Regression      │                      │    Level Rise      │
        │ 4. Predict 6hr     │                      │ 4. Correlate       │
        │    Trend           │                      │    Multiple        │
        └────────────────────┘                      │    Factors         │
                    │                                └────────────────────┘
                    │                                           │
                    └─────────────────┬─────────────────────────┘
                                      ▼
                          ┌────────────────────────┐
                          │   RISK CALCULATION     │
                          ├────────────────────────┤
                          │ LOW: Score 0-30        │
                          │ MEDIUM: Score 30-60    │
                          │ HIGH: Score 60-80      │
                          │ CRITICAL: Score 80+    │
                          └────────────────────────┘
                                      ▼
                          ┌────────────────────────┐
                          │  SHOULD ALERT?         │
                          └────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼ YES                               ▼ NO
        ┌────────────────────┐              ┌────────────────────┐
        │  SEND ALERTS       │              │  LOG DATA          │
        │  • Email           │              │  • Store Reading   │
        │  • SMS (future)    │              │  • Update Charts   │
        │  • Push (future)   │              │  • Broadcast via   │
        │  • WebSocket       │              │    WebSocket       │
        │    Broadcast       │              └────────────────────┘
        └────────────────────┘
                    │
                    ▼
        ┌────────────────────────────────────┐
        │  FRONTEND UPDATE                   │
        │  • Alert Panel Shows New Alert     │
        │  • Risk Level Updated              │
        │  • Audio Warning Plays             │
        │  • Map Marker Updates              │
        │  • Charts Refresh                  │
        └────────────────────────────────────┘
```

## Hardware Component Specifications

### ESP32 Microcontroller
- **Model**: ESP32-WROOM-32
- **Clock**: 240 MHz dual-core
- **RAM**: 520 KB SRAM
- **Flash**: 4 MB
- **WiFi**: 802.11 b/g/n (2.4 GHz)
- **Bluetooth**: BLE 4.2
- **Power**: 3.3V @ 500mA (active), 0.01mA (deep sleep)
- **GPIO**: 34 programmable pins
- **ADC**: 12-bit, 18 channels
- **I2C**: 2 interfaces
- **SPI**: 4 interfaces

### Sensor Suite

#### Temperature Sensor - DS18B20
- **Interface**: OneWire (GPIO4)
- **Range**: -55°C to +125°C
- **Accuracy**: ±0.5°C (-10°C to +85°C)
- **Resolution**: 9-12 bit (configurable)
- **Power**: 3.0-5.5V, 1mA active
- **Response Time**: <750ms
- **Pullup Resistor**: 4.7kΩ required

#### Seismic Sensor - ADXL345
- **Interface**: I2C (GPIO21-SDA, GPIO22-SCL)
- **Type**: 3-axis MEMS accelerometer
- **Range**: ±2g, ±4g, ±8g, ±16g (selectable)
- **Resolution**: 13-bit (±16g), 3.9mg/LSB
- **Sensitivity**: Detects events >0.1g
- **Power**: 2.0-3.6V, 23-140μA
- **Sample Rate**: Up to 3200 Hz
- **Pullup Resistors**: 4.7kΩ on SDA/SCL

#### Water Level Sensor - HC-SR04
- **Interface**: Digital (GPIO5-Trigger, GPIO18-Echo)
- **Type**: Ultrasonic distance sensor
- **Range**: 2 cm to 400 cm
- **Accuracy**: ±3 mm
- **Resolution**: 0.3 cm
- **Beam Angle**: 15 degrees
- **Power**: 5V, 15mA
- **Frequency**: 40 kHz
- **Note**: Echo pin requires voltage divider (5V → 3.3V)

### Power System

#### Solar Panel
- **Type**: Polycrystalline silicon
- **Power**: 6V 2W
- **Open Circuit Voltage**: 6V
- **Short Circuit Current**: 330mA
- **Size**: 110mm × 60mm
- **Efficiency**: 18%
- **Operating Temp**: -40°C to +85°C

#### Battery
- **Type**: Li-Ion 18650
- **Capacity**: 3000 mAh
- **Nominal Voltage**: 3.7V
- **Charge Voltage**: 4.2V
- **Discharge Cutoff**: 3.0V
- **Chemistry**: Lithium-Ion
- **Cycle Life**: >500 cycles
- **Weight**: 48g

#### Charge Controller - TP4056
- **Input Voltage**: 4.5V - 8V
- **Charge Voltage**: 4.2V ±1%
- **Charge Current**: 1A (adjustable)
- **Protection**: Overcharge, over-discharge, short circuit
- **Status LEDs**: Charging (red), Charged (blue)
- **Efficiency**: >85%

#### Voltage Regulator - AMS1117-3.3
- **Input**: 4.5V - 15V
- **Output**: 3.3V ±2%
- **Current**: 1A max
- **Dropout Voltage**: 1.1V
- **Protection**: Thermal shutdown, current limiting

### Communication Modules

#### WiFi (Integrated in ESP32)
- **Standard**: IEEE 802.11 b/g/n
- **Frequency**: 2.4 GHz
- **Range**: 100m outdoor (line of sight)
- **Security**: WPA/WPA2
- **Power Consumption**: 170mA (transmit), 60mA (receive)

#### LoRaWAN - RFM95W
- **Frequency**: 915 MHz (US), 868 MHz (EU)
- **Range**: 2-15 km (line of sight)
- **Data Rate**: 0.3 - 50 kbps
- **Power Output**: +20 dBm (100mW)
- **Sensitivity**: -148 dBm
- **Interface**: SPI
- **Power Consumption**: 120mA (transmit), 10mA (receive), 1μA (sleep)

## Software Architecture

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Real-time**: Socket.IO (WebSocket)
- **HTTP Client**: Axios
- **Email**: Nodemailer + Gmail SMTP
- **Compression**: gzip
- **Database**: In-memory + Firebase (optional)

### Frontend Stack
- **Framework**: Next.js 14.2.33
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Maps**: Leaflet
- **Charts**: Recharts
- **Real-time**: Socket.IO Client

### IoT Simulator Stack
- **Language**: Node.js/JavaScript
- **Web Server**: Express + WebSocket
- **Visualization**: HTML5 + SVG + Canvas
- **Updates**: Real-time via WebSocket

## Power Consumption Analysis

### Current Draw by Mode
| Mode | Current | Duration (per 2min cycle) | Energy |
|------|---------|---------------------------|--------|
| Deep Sleep | 0.01 mA | 60 seconds | 0.0002 mAh |
| Wake/Active | 80 mA | 5 seconds | 0.11 mAh |
| Sensor Read | 50 mA | 2 seconds | 0.03 mAh |
| WiFi Transmit | 170 mA | 3 seconds | 0.14 mAh |
| **TOTAL** | - | 70 seconds | **0.28 mAh/cycle** |

### Battery Life Calculation
- Battery Capacity: 3000 mAh
- Per Cycle Consumption: 0.28 mAh
- Cycles per Day: 720 (every 2 minutes)
- Daily Consumption: 201.6 mAh
- **Battery Life: 14.9 days** (without solar charging)

### Solar Charging
- Solar Panel Output: 330 mA @ 6V (ideal conditions)
- Sunlight Hours: 6-8 hours/day (summer), 4-5 hours/day (winter)
- Daily Charge: 1320-2640 mAh (summer)
- **Result**: System is self-sustaining with adequate sunlight

## Alert Thresholds

### Temperature
- **Normal**: < 5°C
- **Warning**: 5°C - 10°C
- **Alert**: > 10°C
- **Critical**: > 15°C (rapid glacial melt)

### Seismic Activity
- **Normal**: < 0.2g
- **Micro-tremor**: 0.2g - 0.5g
- **Alert**: 0.5g - 0.8g
- **Critical**: > 0.8g (ice dam instability)

### Water Level Change
- **Normal**: < 5 cm/2min
- **Warning**: 5-10 cm/2min
- **Alert**: 10-20 cm/2min
- **Critical**: > 20 cm/2min (dam breach imminent)

### Risk Scoring
```
Risk Score = (Temp Factor × 30) + (Seismic Factor × 40) + (Water Factor × 30)

- LOW: 0-30
- MEDIUM: 30-60
- HIGH: 60-80
- CRITICAL: 80-100
```

## Deployment Locations

### Node 1: Hunza Valley
- **Coordinates**: 36.3167°N, 74.4500°E
- **Elevation**: 2,438 m
- **Glacier**: Hunza Glacier
- **Lake**: Attabad Lake
- **Risk**: High (history of GLOFs)

### Node 2: Chitral
- **Coordinates**: 35.8518°N, 71.7846°E
- **Elevation**: 1,498 m
- **Glacier**: Chitral Glacier
- **Risk**: Medium

### Node 3: Skardu
- **Coordinates**: 35.2971°N, 75.6350°E
- **Elevation**: 2,230 m
- **Glacier**: Skardu Glacier Complex
- **Risk**: High

## Network Topology

```
       [Sensor Node 1]────┐
              │            │
              WiFi         │
              │            │
       [WiFi AP/Router]    │
              │            │
              Internet     LoRaWAN
              │            │
              │      [LoRa Gateway]
              │            │
              └────┬───────┘
                   │
            [Cloud Server]
                   │
        ┌──────────┼──────────┐
        │          │          │
   [Dashboard] [Mobile]  [Alerts]
```

## Security Considerations

1. **Data Encryption**: TLS/SSL for all HTTP/WebSocket traffic
2. **Authentication**: API keys for sensor nodes
3. **Input Validation**: Sanitize all sensor data
4. **Rate Limiting**: Prevent DoS attacks
5. **Secure Storage**: Environment variables for secrets
6. **Physical Security**: Tamper-proof enclosures with locks

## Future Enhancements

1. **Satellite Communication**: Iridium backup for remote areas
2. **Edge Computing**: Local ML processing on ESP32
3. **Mesh Network**: Inter-node communication for redundancy
4. **Advanced ML**: LSTM neural networks for prediction
5. **Drone Integration**: Aerial surveys of glacier conditions
6. **Community App**: Mobile app for villagers
7. **Siren System**: Automated warning sirens in villages
8. **Image Recognition**: Camera module for visual monitoring

---

**Document Version**: 1.0
**Last Updated**: 2025-01-20
**Team**: Project Barfani
**Contact**: mehroz.muneer@gmail.com
