/**
 * IoT Sensor Network Simulator
 * Orchestrates multiple virtual ESP32 nodes
 * Simulates realistic glacier monitoring sensor network
 */

const axios = require('axios');
const ESP32SensorNode = require('./ESP32SensorNode');

const API_URL = process.env.API_URL || 'http://localhost:5001';
const SLEEP_DURATION = 60000; // 1 minute deep sleep
const WAKE_INTERVAL = 120000; // Wake every 2 minutes to read sensors

// Glacier sensor node configurations
const NODE_CONFIGS = {
  'glacier_lake_01': {
    nodeId: 'glacier_lake_01',
    location: {
      name: 'Hunza Valley',
      lat: 36.3167,
      lon: 74.4500
    },
    elevation: 2438,
    baseTemp: -15,
    baseWaterLevel: 280
  },
  'glacier_lake_02': {
    nodeId: 'glacier_lake_02',
    location: {
      name: 'Chitral',
      lat: 35.8518,
      lon: 71.7846
    },
    elevation: 1498,
    baseTemp: -5,
    baseWaterLevel: 265
  },
  'glacier_lake_03': {
    nodeId: 'glacier_lake_03',
    location: {
      name: 'Skardu',
      lat: 35.2971,
      lon: 75.6350
    },
    elevation: 2230,
    baseTemp: -10,
    baseWaterLevel: 270
  }
};

class IoTSimulator {
  constructor() {
    this.nodes = new Map();
    this.running = false;
    this.stats = {
      totalTransmissions: 0,
      failedTransmissions: 0,
      totalPowerConsumed: 0
    };
  }

  /**
   * Initialize all sensor nodes
   */
  initialize() {
    console.log('═'.repeat(80));
    console.log('🚀 Project Barfani - IoT Sensor Network Simulator');
    console.log('═'.repeat(80));
    console.log('Virtual Hardware: ESP32 + DS18B20 + ADXL345 + HC-SR04');
    console.log('Power System: 6V Solar Panel + Li-Ion Battery + Deep Sleep');
    console.log('Communication: WiFi + LoRaWAN (915 MHz)');
    console.log('Backend API:', API_URL);
    console.log('═'.repeat(80));
    console.log('\n📡 Initializing Sensor Nodes:\n');

    for (const [nodeId, config] of Object.entries(NODE_CONFIGS)) {
      const node = new ESP32SensorNode(config);
      this.nodes.set(nodeId, node);
      console.log('');
    }

    console.log('\n✅ All sensor nodes initialized and ready');
    console.log('─'.repeat(80));
  }

  /**
   * Simulate sensor node sleep/wake cycle
   */
  async runNode(nodeId) {
    const node = this.nodes.get(nodeId);

    while (this.running) {
      try {
        // Wake from sleep
        node.wake();

        // Read all sensors
        const sensorData = node.readSensors();

        console.log(`   🌡️  Temperature: ${sensorData.temperature}°C`);
        console.log(`   📊 Seismic Activity: ${sensorData.seismic_activity} (${sensorData.seismic_raw.x.toFixed(3)}g, ${sensorData.seismic_raw.y.toFixed(3)}g, ${sensorData.seismic_raw.z.toFixed(3)}g)`);
        console.log(`   💧 Water Level: ${sensorData.water_level}cm from sensor`);

        // Transmit data to backend
        const protocol = Math.random() > 0.5 ? 'wifi' : 'lora';
        const packet = await node.transmitData(sensorData, protocol);

        // Send to backend
        try {
          const response = await axios.post(`${API_URL}/api/sensor/data`, packet, {
            timeout: 5000
          });

          if (response.data.success) {
            console.log(`   ✅ Data transmitted successfully to backend`);
            this.stats.totalTransmissions++;

            // Check if alert was triggered
            if (response.data.alert && response.data.alert.shouldAlert) {
              console.log(`   🚨 ALERT TRIGGERED: ${response.data.alert.riskLevel} RISK`);
            }
          }
        } catch (error) {
          console.log(`   ❌ Transmission failed: ${error.message}`);
          this.stats.failedTransmissions++;
        }

        // Display power stats
        const status = node.getStatus();
        console.log(`   🔋 Battery: ${status.state.batteryLevel.toFixed(1)}% (${status.state.batteryVoltage.toFixed(2)}V) ${status.state.solarCharging ? '☀️ Charging' : ''}`);
        console.log('');

        // Enter deep sleep to conserve power
        node.enterDeepSleep(SLEEP_DURATION);

        // Wait for wake interval
        await this.sleep(WAKE_INTERVAL);

      } catch (error) {
        console.error(`❌ [${nodeId}] Error:`, error.message);
        await this.sleep(WAKE_INTERVAL);
      }
    }
  }

  /**
   * Start all sensor nodes
   */
  async start() {
    this.running = true;

    console.log('\n🌍 Starting sensor network...');
    console.log(`⏰ Wake interval: ${WAKE_INTERVAL / 1000}s (read sensors + transmit)`);
    console.log(`💤 Sleep duration: ${SLEEP_DURATION / 1000}s (deep sleep mode)`);
    console.log('─'.repeat(80));
    console.log('\n');

    // Run all nodes concurrently
    const nodePromises = Array.from(this.nodes.keys()).map(nodeId => this.runNode(nodeId));

    // Also run stats reporter
    this.startStatsReporter();

    await Promise.all(nodePromises);
  }

  /**
   * Stop simulator
   */
  stop() {
    this.running = false;
    console.log('\n\n🛑 Stopping IoT simulator...');
    this.printFinalStats();
  }

  /**
   * Print statistics periodically
   */
  startStatsReporter() {
    setInterval(() => {
      if (this.running) {
        console.log('\n📊 Network Statistics:');
        console.log(`   Total Transmissions: ${this.stats.totalTransmissions}`);
        console.log(`   Failed Transmissions: ${this.stats.failedTransmissions}`);
        console.log(`   Success Rate: ${((this.stats.totalTransmissions / (this.stats.totalTransmissions + this.stats.failedTransmissions)) * 100).toFixed(1)}%`);

        // Show battery levels for all nodes
        console.log('\n🔋 Node Battery Levels:');
        for (const [nodeId, node] of this.nodes) {
          const status = node.getStatus();
          console.log(`   ${nodeId}: ${status.state.batteryLevel.toFixed(1)}% ${status.state.solarCharging ? '☀️' : '🌙'}`);
        }
        console.log('');
      }
    }, 300000); // Every 5 minutes
  }

  /**
   * Print final statistics
   */
  printFinalStats() {
    console.log('\n═'.repeat(80));
    console.log('📈 Final Network Statistics');
    console.log('═'.repeat(80));
    console.log(`Total Transmissions: ${this.stats.totalTransmissions}`);
    console.log(`Failed Transmissions: ${this.stats.failedTransmissions}`);
    console.log(`Success Rate: ${((this.stats.totalTransmissions / (this.stats.totalTransmissions + this.stats.failedTransmissions)) * 100).toFixed(1)}%`);
    console.log('\n🔋 Final Battery Levels:');
    for (const [nodeId, node] of this.nodes) {
      const status = node.getStatus();
      console.log(`   ${nodeId}: ${status.state.batteryLevel.toFixed(1)}%`);
    }
    console.log('═'.repeat(80));
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Handle graceful shutdown
let simulator;

process.on('SIGINT', () => {
  if (simulator) {
    simulator.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (simulator) {
    simulator.stop();
  }
  process.exit(0);
});

// Start simulator
if (require.main === module) {
  simulator = new IoTSimulator();
  simulator.initialize();
  simulator.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = IoTSimulator;
