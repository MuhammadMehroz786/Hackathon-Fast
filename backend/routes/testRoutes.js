const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5001';

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

/**
 * Generate test data for specific scenario
 */
function generateTestData(node, scenario) {
  let temp, seismic, waterLevel;

  switch (scenario) {
    case 'medium':
      // Medium risk - early warning signs
      temp = node.baseTemp + 5 + (Math.random() * 2);
      seismic = node.baseSeismic + 0.15 + (Math.random() * 0.08);
      waterLevel = node.baseWaterLevel + 20 + (Math.random() * 8);
      break;

    case 'high':
      // High risk - significant changes
      temp = node.baseTemp + 10 + (Math.random() * 3);
      seismic = node.baseSeismic + 0.35 + (Math.random() * 0.15);
      waterLevel = node.baseWaterLevel + 50 + (Math.random() * 15);
      break;

    case 'warning':
    case 'critical':
      // Critical risk - dangerous conditions
      temp = node.baseTemp + 18 + (Math.random() * 5);
      seismic = node.baseSeismic + 0.6 + (Math.random() * 0.3);
      waterLevel = node.baseWaterLevel + 80 + (Math.random() * 20);
      break;

    case 'normal':
    default:
      // Normal conditions
      temp = node.baseTemp + (Math.random() - 0.5) * 3;
      seismic = node.baseSeismic + (Math.random() - 0.5) * 0.05;
      waterLevel = node.baseWaterLevel + (Math.random() - 0.5) * 8;
      break;
  }

  return {
    node_id: node.node_id,
    temperature: parseFloat(temp.toFixed(2)),
    seismic_activity: parseFloat(Math.max(0, seismic).toFixed(3)),
    water_level: parseFloat(Math.max(100, waterLevel).toFixed(2)),
    battery: Math.floor(75 + Math.random() * 20),
    signal_strength: Math.floor(75 + Math.random() * 20),
    test_scenario: scenario
  };
}

/**
 * POST /api/test/scenario
 * Trigger a test scenario to see system response
 */
router.post('/scenario', async (req, res) => {
  try {
    const { scenario = 'normal' } = req.body;

    const validBaseline = ['normal', 'medium', 'high', 'warning', 'critical'];
    const validHistorical = Object.keys(historicalScenarios);
    const allValid = [...validBaseline, ...validHistorical];

    if (!allValid.includes(scenario)) {
      return res.status(400).json({
        success: false,
        error: `Invalid scenario. Must be one of: ${allValid.join(', ')}`
      });
    }

    const isHistorical = validHistorical.includes(scenario);
    console.log(`🧪 Running ${isHistorical ? 'historical' : 'baseline'} test: ${scenario.toUpperCase()}`);

    const results = [];

    // Send test data from all nodes
    for (const node of sensorNodes) {
      const testData = isHistorical
        ? generateHistoricalData(node, scenario)
        : generateTestData(node, scenario);

      try {
        const response = await axios.post(`${API_URL}/api/sensor/data`, testData);
        results.push({
          node_id: node.node_id,
          data: testData,
          alert: response.data.alert
        });

        console.log(`✅ [${node.node_id}] ${testData.temperature}°C | Risk: ${response.data.alert.riskLevel}`);
      } catch (error) {
        console.error(`❌ Error for ${node.node_id}:`, error.message);
        results.push({
          node_id: node.node_id,
          data: testData,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      scenario,
      message: `Test scenario '${scenario}' executed successfully`,
      results
    });

  } catch (error) {
    console.error('Test scenario error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Historical GLOF scenarios based on real events
 */
const historicalScenarios = {
  'hunza_2020': {
    name: 'Hunza GLOF 2020',
    date: 'May 2020',
    location: 'Hunza Valley',
    description: 'Real GLOF event - Lake outburst in Hunza Valley',
    tempIncrease: 15,
    seismicIncrease: 0.5,
    waterIncrease: 120,
    riskLevel: 'CRITICAL'
  },
  'shishper_2022': {
    name: 'Shishper Glacier 2022',
    date: 'November 2022',
    location: 'Hassanabad, Hunza',
    description: 'Shishper glacier outburst - Major GLOF event',
    tempIncrease: 12,
    seismicIncrease: 0.4,
    waterIncrease: 80,
    riskLevel: 'CRITICAL'
  },
  'passu_2018': {
    name: 'Passu Glacier 2018',
    date: 'June 2018',
    location: 'Passu, Gojal Valley',
    description: 'Moderate glacial lake expansion event',
    tempIncrease: 8,
    seismicIncrease: 0.25,
    waterIncrease: 50,
    riskLevel: 'HIGH'
  },
  'batura_2019': {
    name: 'Batura Glacier 2019',
    date: 'July 2019',
    location: 'Batura, Hunza',
    description: 'Warning signs - Elevated melt rates',
    tempIncrease: 6,
    seismicIncrease: 0.18,
    waterIncrease: 30,
    riskLevel: 'MEDIUM'
  }
};

/**
 * Generate test data based on historical scenario
 */
function generateHistoricalData(node, scenarioKey) {
  const scenario = historicalScenarios[scenarioKey];
  if (!scenario) {
    return generateTestData(node, 'normal');
  }

  const temp = node.baseTemp + scenario.tempIncrease + (Math.random() * 2);
  const seismic = node.baseSeismic + scenario.seismicIncrease + (Math.random() * 0.1);
  const waterLevel = node.baseWaterLevel + scenario.waterIncrease + (Math.random() * 10);

  return {
    node_id: node.node_id,
    temperature: parseFloat(temp.toFixed(2)),
    seismic_activity: parseFloat(Math.max(0, seismic).toFixed(3)),
    water_level: parseFloat(Math.max(100, waterLevel).toFixed(2)),
    battery: Math.floor(75 + Math.random() * 20),
    signal_strength: Math.floor(75 + Math.random() * 20),
    test_scenario: scenarioKey,
    historical_event: scenario.name,
    event_date: scenario.date
  };
}

/**
 * GET /api/test/scenarios
 * List available test scenarios including historical events
 */
router.get('/scenarios', (req, res) => {
  res.json({
    success: true,
    scenarios: [
      {
        name: 'normal',
        description: 'Normal glacier conditions - stable temperatures and water levels',
        riskLevel: 'LOW',
        type: 'baseline'
      },
      {
        name: 'medium',
        description: 'Medium risk - Early warning signs detected',
        riskLevel: 'MEDIUM',
        type: 'baseline'
      },
      {
        name: 'high',
        description: 'High risk - Significant changes in glacier behavior',
        riskLevel: 'HIGH',
        type: 'baseline'
      },
      {
        name: 'critical',
        description: 'Critical conditions - Immediate GLOF risk',
        riskLevel: 'CRITICAL',
        type: 'baseline'
      },
      ...Object.entries(historicalScenarios).map(([key, data]) => ({
        name: key,
        displayName: data.name,
        date: data.date,
        location: data.location,
        description: data.description,
        riskLevel: data.riskLevel,
        type: 'historical'
      }))
    ]
  });
});

module.exports = router;
