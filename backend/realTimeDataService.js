/**
 * Real-Time Data Service
 * Fetches ACTUAL weather data from Open-Meteo API for glacier locations
 * Combines with realistic seismic and water level simulations
 * Sends data to backend every 2 minutes
 *
 * DEMO_MODE: Amplifies real data to show potential danger scenarios
 */

const axios = require('axios');
const { fetchRealWeatherData, applyRealPatterns, REAL_GLACIER_PATTERNS, GLACIER_LOCATIONS } = require('./utils/realDataFetcher');

const API_URL = process.env.API_URL || 'http://localhost:5001';
const UPDATE_INTERVAL = 120000; // 2 minutes
const DEMO_MODE = process.env.DEMO_MODE === 'true' || false; // Disabled - showing real safe winter conditions

// Track water levels for realistic trends
const waterLevelHistory = {
  'glacier_lake_01': 280,
  'glacier_lake_02': 265,
  'glacier_lake_03': 270
};

// Track seismic activity for realistic patterns
let seismicBaseline = 0.1;

/**
 * Generate realistic seismic activity
 * Based on actual GLOF precursor patterns
 */
function generateRealisticSeismic(demoMode = false) {
  if (demoMode) {
    // In demo mode, occasionally generate higher seismic activity
    const random = Math.random();
    if (random < 0.6) {
      // 60% normal
      return parseFloat((0.2 + Math.random() * 0.3).toFixed(3));
    } else if (random < 0.85) {
      // 25% elevated
      return parseFloat((0.5 + Math.random() * 0.3).toFixed(3));
    } else {
      // 15% high risk
      return parseFloat((0.8 + Math.random() * 0.4).toFixed(3));
    }
  }

  // Normal mode
  const random = Math.random();

  if (random < 0.85) {
    return parseFloat((REAL_GLACIER_PATTERNS.seismicIndicators.stable + Math.random() * 0.1).toFixed(3));
  } else if (random < 0.97) {
    return parseFloat((REAL_GLACIER_PATTERNS.seismicIndicators.microTremor + Math.random() * 0.2).toFixed(3));
  } else {
    return parseFloat((REAL_GLACIER_PATTERNS.seismicIndicators.dangerZone + Math.random() * 0.3).toFixed(3));
  }
}

/**
 * Update water level based on temperature and season
 * Higher temps = more glacial melt = higher water levels
 */
function updateWaterLevel(nodeId, temperature, demoMode = false) {
  const currentLevel = waterLevelHistory[nodeId];
  let change = 0;

  if (demoMode) {
    // In demo mode, simulate seasonal melt patterns
    // Add trending increase to show danger
    change = Math.random() * 8 + 2; // 2-10cm increase
  } else {
    // Normal mode based on temperature
    if (temperature > 5) {
      change = Math.random() * REAL_GLACIER_PATTERNS.waterLevelChanges.meltSeason;
    } else if (temperature > 0) {
      change = Math.random() * REAL_GLACIER_PATTERNS.waterLevelChanges.normalDaily;
    } else {
      change = (Math.random() - 0.5) * REAL_GLACIER_PATTERNS.waterLevelChanges.normalDaily;
    }
  }

  // Update with bounds (200cm - 400cm realistic range)
  const newLevel = Math.max(200, Math.min(400, currentLevel + change));
  waterLevelHistory[nodeId] = newLevel;

  return parseFloat(newLevel.toFixed(1));
}

/**
 * Adjust real temperature for demo purposes
 * Shows what temperatures would be like during summer melt season
 */
function adjustTemperatureForDemo(realTemp, elevation) {
  // Simulate summer conditions (what it would be like in May-July)
  // Add seasonal warming
  const summerBoost = 15 + Math.random() * 10; // 15-25°C warmer in summer
  const adjustedTemp = realTemp + summerBoost;

  // Add daily variation
  const dailyVariation = (Math.random() - 0.5) * 6;

  return parseFloat((adjustedTemp + dailyVariation).toFixed(1));
}

/**
 * Fetch and send real data for all glacier locations
 */
async function fetchAndSendRealData() {
  const mode = DEMO_MODE ? '🎭 DEMO MODE' : '🌍 REAL MODE';
  console.log(`\n${mode} - Fetching weather data from glacier locations...`);

  for (const [nodeId, location] of Object.entries(GLACIER_LOCATIONS)) {
    try {
      // Fetch REAL weather data from Open-Meteo
      const realWeather = await fetchRealWeatherData(nodeId);

      if (realWeather) {
        console.log(`\n📡 ${location.name} (${location.lat}, ${location.lon}):`);
        console.log(`   🌡️  Real Temperature: ${realWeather.temperature}°C`);
        console.log(`   💧 Humidity: ${realWeather.humidity}%`);
        console.log(`   💨 Wind Speed: ${realWeather.windSpeed} km/h`);

        // Apply elevation correction for glacier temperature
        const elevationCorrection = -6.5; // Lapse rate: -6.5°C per 1000m
        const elevationKm = location.elevation / 1000;
        let glacierTemp = realWeather.temperature + (elevationCorrection * elevationKm);

        // In demo mode, adjust temperature to show summer melt scenario
        if (DEMO_MODE) {
          glacierTemp = adjustTemperatureForDemo(glacierTemp, location.elevation);
          console.log(`   🎭 Demo Summer Temp: ${glacierTemp.toFixed(1)}°C (simulating May-July conditions)`);
        } else {
          console.log(`   🏔️  Glacier Temperature (at ${location.elevation}m): ${glacierTemp.toFixed(1)}°C`);
        }

        // Generate realistic seismic activity
        const seismicActivity = generateRealisticSeismic(DEMO_MODE);

        // Update water level based on real temperature
        const waterLevel = updateWaterLevel(nodeId, glacierTemp, DEMO_MODE);

        // Determine water level change
        const previousLevel = waterLevelHistory[nodeId];
        const waterChange = waterLevel - previousLevel;

        // Create sensor data packet
        const sensorData = {
          node_id: nodeId,
          temperature: parseFloat(glacierTemp.toFixed(1)),
          seismic_activity: seismicActivity,
          water_level: waterLevel,
          battery: 70 + Math.floor(Math.random() * 25), // 70-95%
          signal_strength: 60 + Math.floor(Math.random() * 35), // 60-95%
          humidity: realWeather.humidity,
          wind_speed: realWeather.windSpeed,
          latitude: location.lat,
          longitude: location.lon,
          location_name: location.name,
          elevation: location.elevation,
          data_source: DEMO_MODE ? 'Open-Meteo API (Demo Mode - Summer Scenario)' : 'Open-Meteo API (Real Weather)',
          timestamp: new Date().toISOString()
        };

        // Send to backend
        const response = await axios.post(`${API_URL}/api/sensor/data`, sensorData);

        if (response.data.success) {
          console.log(`   ✅ Data sent successfully`);

          // Show water level trend
          if (waterChange > 5) {
            console.log(`   ⚠️  Water level rising: +${waterChange.toFixed(1)}cm`);
          } else if (waterChange < -5) {
            console.log(`   ⬇️  Water level falling: ${waterChange.toFixed(1)}cm`);
          }

          // Show seismic warnings
          if (seismicActivity > REAL_GLACIER_PATTERNS.seismicIndicators.dangerZone) {
            console.log(`   🚨 ELEVATED SEISMIC ACTIVITY: ${seismicActivity}`);
          }

          // Check if alert was generated
          if (response.data.alert && response.data.alert.shouldAlert) {
            console.log(`   🚨 ALERT GENERATED: ${response.data.alert.riskLevel} RISK`);
            console.log(`   📧 Alert emails sent!`);
          }
        }
      } else {
        console.log(`⚠️  Could not fetch real data for ${nodeId}, skipping...`);
      }

    } catch (error) {
      console.error(`❌ Error processing ${nodeId}:`, error.message);
    }

    // Small delay between locations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Data update cycle complete');
  console.log(`⏰ Next update in ${UPDATE_INTERVAL / 1000} seconds\n`);
}

/**
 * Start the real-time data service
 */
async function startRealTimeService() {
  console.log('🚀 Starting Real-Time Data Service');
  console.log('📍 Monitoring Glacier Locations:');
  Object.entries(GLACIER_LOCATIONS).forEach(([id, loc]) => {
    console.log(`   - ${loc.name} (${loc.lat}, ${loc.lon}) @ ${loc.elevation}m`);
  });
  console.log(`🔄 Update Interval: Every ${UPDATE_INTERVAL / 1000} seconds`);
  console.log('🌍 Data Source: Open-Meteo Weather API (Real-time)');
  console.log(`${DEMO_MODE ? '🎭 DEMO MODE ENABLED - Simulating summer melt conditions for alerts' : '❄️  Real winter conditions (may not generate alerts)'}`);
  console.log('─'.repeat(70));

  // Initial fetch
  await fetchAndSendRealData();

  // Set up recurring updates
  setInterval(fetchAndSendRealData, UPDATE_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping Real-Time Data Service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Stopping Real-Time Data Service...');
  process.exit(0);
});

// Start the service
if (require.main === module) {
  startRealTimeService().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { startRealTimeService, fetchAndSendRealData };
