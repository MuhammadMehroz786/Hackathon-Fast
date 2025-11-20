/**
 * IoT Simulator with Backend Transmission
 * Runs virtual sensor nodes AND sends data to the backend API
 * This integrates the IoT simulator with the PDMA dashboard
 */

const axios = require('axios');
const ESP32SensorNode = require('./ESP32SensorNode');

const API_URL = process.env.API_URL || 'http://localhost:5001';
const TRANSMIT_INTERVAL = 10000; // Send data every 10 seconds

// Initialize sensor nodes
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

const nodes = new Map();

// Initialize all nodes
console.log('═'.repeat(80));
console.log('🚀 IoT Simulator → PDMA Dashboard Integration');
console.log('═'.repeat(80));
console.log('Initializing virtual sensor nodes...\n');

for (const [nodeId, config] of Object.entries(NODE_CONFIGS)) {
  nodes.set(nodeId, new ESP32SensorNode(config));
  console.log('');
}

console.log('\n✅ All nodes initialized');
console.log(`📡 Transmitting to: ${API_URL}/api/sensor/data`);
console.log(`⏰ Transmission interval: ${TRANSMIT_INTERVAL / 1000} seconds`);
console.log(`🌐 View data at: http://localhost:3000 (PDMA Dashboard)`);
console.log('═'.repeat(80));
console.log('\n');

// Transmit data from all nodes
async function transmitAllNodes() {
  for (const [nodeId, node] of nodes) {
    try {
      // Wake node
      node.wake();

      // Read all sensors
      const readings = node.readSensors();
      const status = node.getStatus();

      // Prepare data packet
      const packet = {
        node_id: nodeId,
        temperature: readings.temperature,
        seismic_activity: readings.seismic_activity,
        water_level: readings.water_level,
        battery: Math.round(status.state.batteryLevel),
        signal_strength: 60 + Math.floor(Math.random() * 35),
        latitude: status.location.lat,
        longitude: status.location.lon,
        location_name: status.location.name,
        elevation: status.elevation,
        timestamp: readings.timestamp
      };

      // Send to backend
      const response = await axios.post(`${API_URL}/api/sensor/data`, packet, {
        timeout: 5000
      });

      if (response.data.success) {
        console.log(`✅ [${nodeId}] Data transmitted to PDMA dashboard`);

        // Check for alerts
        if (response.data.alert && response.data.alert.shouldAlert) {
          console.log(`   🚨 ALERT: ${response.data.alert.riskLevel} risk detected!`);
        }
      }

      // Simulate power management
      node.simulateSolarCharging(TRANSMIT_INTERVAL);
      node.simulateBatteryDrain('active', 2000);

      console.log(`   🔋 Battery: ${status.state.batteryLevel.toFixed(1)}%\n`);

    } catch (error) {
      console.error(`❌ [${nodeId}] Transmission failed:`, error.message);
    }
  }

  console.log(`⏰ Next transmission in ${TRANSMIT_INTERVAL / 1000}s...\n`);
}

// Initial transmission
transmitAllNodes();

// Set up recurring transmissions
setInterval(transmitAllNodes, TRANSMIT_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping IoT simulator...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Stopping IoT simulator...');
  process.exit(0);
});
