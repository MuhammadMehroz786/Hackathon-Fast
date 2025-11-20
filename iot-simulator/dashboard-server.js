/**
 * IoT Dashboard Server
 * Web-based visualization of virtual hardware, circuit diagrams, and real-time sensor data
 */

const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const ESP32SensorNode = require('./ESP32SensorNode');

const app = express();
const PORT = 8080;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize virtual nodes for dashboard
const nodes = new Map();

const NODE_CONFIGS = {
  'glacier_lake_01': {
    nodeId: 'glacier_lake_01',
    location: { name: 'Hunza Valley', lat: 36.3167, lon: 74.4500 },
    elevation: 2438,
    baseTemp: -15,
    baseWaterLevel: 280
  },
  'glacier_lake_02': {
    nodeId: 'glacier_lake_02',
    location: { name: 'Chitral', lat: 35.8518, lon: 71.7846 },
    elevation: 1498,
    baseTemp: -5,
    baseWaterLevel: 265
  },
  'glacier_lake_03': {
    nodeId: 'glacier_lake_03',
    location: { name: 'Skardu', lat: 35.2971, lon: 75.6350 },
    elevation: 2230,
    baseTemp: -10,
    baseWaterLevel: 270
  }
};

// Initialize nodes
for (const [nodeId, config] of Object.entries(NODE_CONFIGS)) {
  nodes.set(nodeId, new ESP32SensorNode(config));
}

// API endpoint to get node status
app.get('/api/nodes', (req, res) => {
  const nodeStatuses = {};
  for (const [nodeId, node] of nodes) {
    nodeStatuses[nodeId] = node.getStatus();
  }
  res.json(nodeStatuses);
});

// API endpoint to get live sensor readings
app.get('/api/readings/:nodeId', (req, res) => {
  const node = nodes.get(req.params.nodeId);
  if (!node) {
    return res.status(404).json({ error: 'Node not found' });
  }

  const readings = node.readSensors();
  const status = node.getStatus();

  res.json({
    ...readings,
    battery: status.state.batteryLevel,
    batteryVoltage: status.state.batteryVoltage,
    solarCharging: status.state.solarCharging,
    powerMode: status.state.powerMode
  });
});

// Circuit diagram data endpoint
app.get('/api/circuit-specs', (req, res) => {
  res.json({
    esp32: {
      model: 'ESP32-WROOM-32',
      pins: {
        temperature: 'GPIO4 (DS18B20 - OneWire)',
        seismic_sda: 'GPIO21 (ADXL345 - I2C SDA)',
        seismic_scl: 'GPIO22 (ADXL345 - I2C SCL)',
        water_trig: 'GPIO5 (HC-SR04 Trigger)',
        water_echo: 'GPIO18 (HC-SR04 Echo)',
        solar_charge: 'GPIO34 (ADC - Battery Monitor)',
        power_3v3: '3.3V Output',
        ground: 'GND'
      },
      power: '3.3V @ 500mA (via TP4056 charge controller)'
    },
    sensors: {
      temperature: {
        model: 'DS18B20',
        interface: 'OneWire (GPIO4)',
        range: '-55°C to +125°C',
        accuracy: '±0.5°C',
        power: '3.3V, 1mA active',
        pullup: '4.7kΩ resistor required'
      },
      seismic: {
        model: 'ADXL345',
        interface: 'I2C (GPIO21-SDA, GPIO22-SCL)',
        range: '±2g to ±16g (configurable)',
        sensitivity: '3.9mg/LSB',
        power: '3.3V, 140μA',
        pullup: '4.7kΩ on SDA/SCL'
      },
      waterLevel: {
        model: 'HC-SR04',
        interface: 'Digital (GPIO5-Trig, GPIO18-Echo)',
        range: '2cm to 400cm',
        accuracy: '±3mm',
        power: '5V, 15mA',
        note: 'Requires 5V (use voltage divider on Echo pin)'
      }
    },
    power: {
      solarPanel: {
        model: '6V 2W Polycrystalline',
        voltage: '6V open circuit',
        current: '330mA max',
        size: '110mm x 60mm',
        efficiency: '18%'
      },
      battery: {
        model: 'Li-Ion 18650',
        voltage: '3.7V nominal (3.0V-4.2V)',
        capacity: '3000mAh',
        chemistry: 'Lithium-Ion'
      },
      chargeController: {
        model: 'TP4056',
        input: '4.5V-8V (from solar)',
        output: '4.2V (Li-Ion charging)',
        current: '1A max',
        protection: 'Overcharge, over-discharge, short circuit'
      },
      regulator: {
        model: 'AMS1117-3.3',
        input: '3.7V (from battery)',
        output: '3.3V @ 1A',
        dropout: '1.1V'
      }
    },
    communication: {
      wifi: {
        standard: '802.11 b/g/n',
        frequency: '2.4 GHz',
        range: '100m outdoor',
        power: '170mA transmit'
      },
      lora: {
        model: 'RFM95W',
        frequency: '915 MHz (US) / 868 MHz (EU)',
        range: '2-15km line of sight',
        power: '120mA transmit, 10mA receive',
        interface: 'SPI (GPIO23-MOSI, GPIO19-MISO, GPIO18-SCK, GPIO5-CS)'
      }
    },
    enclosure: {
      type: 'IP67 Weatherproof ABS',
      size: '200mm x 150mm x 100mm',
      mounting: 'Pole/wall mount with stainless steel brackets',
      temperature: '-40°C to +85°C operating range'
    }
  });
});

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log('═'.repeat(80));
  console.log('🔌 IoT Hardware Dashboard Server');
  console.log('═'.repeat(80));
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log('Features:');
  console.log('  - Real-time circuit diagrams');
  console.log('  - Live sensor readings');
  console.log('  - Power management visualization');
  console.log('  - Hardware specifications');
  console.log('═'.repeat(80));
});

// WebSocket for real-time updates
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('📱 Dashboard client connected');

  // Send initial node data
  const nodeStatuses = {};
  for (const [nodeId, node] of nodes) {
    nodeStatuses[nodeId] = node.getStatus();
  }
  ws.send(JSON.stringify({ type: 'init', data: nodeStatuses }));

  // Send updates every 5 seconds
  const interval = setInterval(() => {
    const updates = {};
    for (const [nodeId, node] of nodes) {
      const readings = node.readSensors();
      const status = node.getStatus();
      node.simulateSolarCharging(5000);
      node.simulateBatteryDrain('active', 5000);

      updates[nodeId] = {
        ...readings,
        battery: status.state.batteryLevel,
        batteryVoltage: status.state.batteryVoltage,
        solarCharging: status.state.solarCharging
      };
    }

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'update', data: updates }));
    }
  }, 5000);

  ws.on('close', () => {
    console.log('📱 Dashboard client disconnected');
    clearInterval(interval);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  server.close();
  process.exit(0);
});
