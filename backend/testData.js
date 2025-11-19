/**
 * Test data generator for Project Barfani
 * Run this to simulate sensor data being sent to the API
 */

const axios = require('axios');
const { fetchRealWeatherData, applyRealPatterns, REAL_GLACIER_PATTERNS } = require('./utils/realDataFetcher');

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Cache for real weather data (refresh every 10 minutes)
let realWeatherCache = {};
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Sensor node configurations
const sensorNodes = [
  {
    node_id: 'glacier_lake_01',
    location: 'Gilgit-Baltistan, Hunza Valley',
    baseTemp: -8,
    baseSeismic: 0.2,
    baseWaterLevel: 250
  },
  {
    node_id: 'glacier_lake_02',
    location: 'Chitral, Hindu Kush',
    baseTemp: -12,
    baseSeismic: 0.15,
    baseWaterLevel: 180
  },
  {
    node_id: 'glacier_lake_03',
    location: 'Skardu, Karakoram Range',
    baseTemp: -15,
    baseSeismic: 0.25,
    baseWaterLevel: 320
  }
];

// Track iteration count for realistic patterns
let iteration = 0;

/**
 * Fetch real weather data for all locations (with caching)
 */
async function fetchRealDataIfNeeded() {
  const now = Date.now();

  // Check if cache is still valid
  if (now - lastFetchTime < CACHE_DURATION && Object.keys(realWeatherCache).length > 0) {
    return realWeatherCache;
  }

  console.log('\n🌍 Fetching REAL weather data from Northern Pakistan...');

  // Fetch real data for all nodes
  for (const node of sensorNodes) {
    try {
      const realData = await fetchRealWeatherData(node.node_id);
      if (realData) {
        realWeatherCache[node.node_id] = realData;
        console.log(`✅ ${realData.location}: ${realData.temperature}°C (Real data)`);
      }
    } catch (error) {
      console.log(`⚠️  Using simulation for ${node.node_id}`);
    }
  }

  lastFetchTime = now;
  return realWeatherCache;
}

/**
 * Generate realistic sensor reading with actual glacier behavior patterns
 * NOW ENHANCED WITH REAL WEATHER DATA!
 */
async function generateSensorReading(node, scenario = 'normal') {
  let temp, seismic, waterLevel;

  // Time of day effect (simulating diurnal temperature variation)
  const hour = new Date().getHours();
  const diurnalEffect = Math.sin((hour - 6) * Math.PI / 12) * 2; // Warmer at midday

  // Add seasonal trend (slow warming)
  const seasonalTrend = iteration * 0.01;

  switch (scenario) {
    case 'warning':
      // Gradually increasing risk
      temp = node.baseTemp + diurnalEffect + seasonalTrend + (iteration * 0.3) + (Math.random() * 3);
      seismic = node.baseSeismic + (iteration * 0.02) + (Math.random() * 0.2);
      waterLevel = node.baseWaterLevel + (iteration * 1.5) + (Math.random() * 5);
      break;

    case 'critical':
      // Dangerous accelerating pattern
      const criticalMultiplier = 1 + (iteration * 0.1);
      temp = node.baseTemp + 15 + diurnalEffect + (iteration * 0.5) + (Math.random() * 5);
      seismic = node.baseSeismic + 0.4 + (iteration * 0.05) + (Math.random() * 0.3);
      waterLevel = node.baseWaterLevel + (iteration * 3) + (Math.random() * 15);

      // Add occasional "tremors" - seismic spikes
      if (Math.random() > 0.7) {
        seismic += Math.random() * 0.5;
      }
      break;

    case 'normal':
    default:
      // Realistic normal fluctuations with patterns

      // Temperature: diurnal cycle + realistic hourly variation + trend
      const tempTrend = Math.sin(iteration * 0.05) * 2; // Slow multi-hour trend
      temp = node.baseTemp + diurnalEffect + tempTrend + (Math.random() - 0.5) * 3;

      // Seismic: mostly stable with occasional micro-tremors
      seismic = node.baseSeismic + (Math.random() - 0.5) * 0.05;
      if (Math.random() > 0.95) { // 5% chance of micro-tremor
        seismic += Math.random() * 0.15;
      }

      // Water level: slight wave pattern + random + melt cycles
      const wavePattern = Math.sin(iteration * 0.1) * 3;
      const meltCycle = Math.sin(iteration * 0.03) * 8; // Slower melt cycle
      waterLevel = node.baseWaterLevel + wavePattern + meltCycle + (Math.random() - 0.5) * 8;

      break;
  }

  // Add realistic noise to all readings
  temp += (Math.random() - 0.5) * 0.3;  // Sensor noise
  seismic += (Math.random() - 0.5) * 0.01; // Sensor noise
  waterLevel += (Math.random() - 0.5) * 1; // Wave noise

  iteration++;

  let sensorData = {
    node_id: node.node_id,
    temperature: parseFloat(temp.toFixed(2)),
    seismic_activity: parseFloat(Math.max(0, seismic).toFixed(3)),
    water_level: parseFloat(Math.max(100, waterLevel).toFixed(2)),
    battery: Math.floor(Math.max(65, 100 - (iteration * 0.1))), // Slowly draining
    signal_strength: Math.floor(75 + Math.random() * 20 + (Math.random() > 0.9 ? -20 : 0)) // Occasional signal drops
  };

  // Apply real weather data if available
  const realWeather = realWeatherCache[node.node_id];
  if (realWeather) {
    sensorData = applyRealPatterns(sensorData, realWeather);
    sensorData.using_real_data = true;
    sensorData.real_temp_source = realWeather.temperature;
  }

  return sensorData;
}

/**
 * Send sensor data to API
 */
async function sendSensorData(data) {
  try {
    const response = await axios.post(`${API_URL}/api/sensor/data`, data);
    console.log(`✅ [${data.node_id}] ${data.temperature}°C | Seismic: ${data.seismic_activity} | Water: ${data.water_level}cm`);

    if (response.data.alert.shouldAlert) {
      console.log(`   🚨 ALERT: ${response.data.alert.riskLevel} - ${response.data.alert.alertMessage}`);
    }

    return response.data;
  } catch (error) {
    console.error(`❌ Error sending data:`, error.message);
  }
}

/**
 * Simulate continuous sensor data
 * NOW WITH REAL WEATHER DATA INTEGRATION!
 */
async function simulateContinuousData(intervalSeconds = 5, scenario = 'normal') {
  console.log(`\n🏔️  Starting Project Barfani Sensor Simulation`);
  console.log(`📡 Sending to: ${API_URL}`);
  console.log(`⏱️  Interval: ${intervalSeconds} seconds`);
  console.log(`📊 Scenario: ${scenario.toUpperCase()}`);
  console.log(`\n🌍 ENHANCED WITH REAL WEATHER DATA!`);
  console.log(`📍 Locations: Hunza Valley, Chitral, Skardu`);
  console.log(`\n🌡️  Using real data patterns:\n`);
  console.log(`   • Real-time weather from Northern Pakistan`);
  console.log(`   • Actual elevation corrections`);
  console.log(`   • Historical GLOF patterns`);
  console.log(`   • Diurnal temperature cycles`);
  console.log(`   • Seismic micro-tremors`);
  console.log(`   • Water level wave patterns\n`);

  // Reset iteration for new scenario
  iteration = 0;

  // Fetch initial real data
  await fetchRealDataIfNeeded();

  setInterval(async () => {
    console.log(`\n--- Iteration ${iteration + 1} (${new Date().toLocaleTimeString()}) ---`);

    // Refresh real weather data periodically
    await fetchRealDataIfNeeded();

    // Send data from all nodes
    for (const node of sensorNodes) {
      const reading = await generateSensorReading(node, scenario);
      await sendSensorData(reading);

      // Show if using real data
      if (reading.using_real_data) {
        console.log(`   📡 Real weather: ${reading.real_temp_source}°C at ground level`);
      }
    }
  }, intervalSeconds * 1000);
}

/**
 * Test with different scenarios
 */
async function runScenarioTest() {
  console.log('\n🧪 Running Scenario Tests\n');

  // Test 1: Normal readings
  console.log('📗 Test 1: Normal Conditions');
  const normalData = generateSensorReading(sensorNodes[0], 'normal');
  await sendSensorData(normalData);

  await sleep(2000);

  // Test 2: Warning level
  console.log('\n📙 Test 2: Warning Level');
  const warningData = generateSensorReading(sensorNodes[1], 'warning');
  await sendSensorData(warningData);

  await sleep(2000);

  // Test 3: Critical alert
  console.log('\n📕 Test 3: Critical Alert');
  const criticalData = generateSensorReading(sensorNodes[2], 'critical');
  await sendSensorData(criticalData);

  console.log('\n✅ Scenario tests complete\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
const args = process.argv.slice(2);
const command = args[0] || 'test';

if (command === 'continuous') {
  const interval = parseInt(args[1]) || 5;
  const scenario = args[2] || 'normal';
  simulateContinuousData(interval, scenario);
} else if (command === 'test') {
  runScenarioTest();
} else {
  console.log(`
Usage:
  node testData.js test                           - Run scenario tests
  node testData.js continuous [interval] [scenario] - Continuous simulation

Scenarios: normal, warning, critical
Example: node testData.js continuous 5 critical
  `);
}
