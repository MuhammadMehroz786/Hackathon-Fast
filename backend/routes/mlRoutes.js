const express = require('express');
const router = express.Router();
const axios = require('axios');
const { generateMLInsights } = require('../utils/mlEngine');

const API_URL = process.env.API_URL || 'http://localhost:5001';

/**
 * GET /api/ml/insights/:nodeId
 * Get ML-based insights for a specific sensor node
 */
router.get('/insights/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;

    // Fetch sensor data from sensor API
    const response = await axios.get(`${API_URL}/api/sensor/node/${nodeId}?limit=50`);

    if (!response.data.success || !response.data.readings || response.data.readings.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No readings found for node ${nodeId}`
      });
    }

    const readings = response.data.readings;

    // Generate ML insights
    const insights = generateMLInsights(readings, nodeId);

    res.json(insights);

  } catch (error) {
    console.error('ML insights error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ml/insights
 * Get ML insights for all nodes
 */
router.get('/insights', async (req, res) => {
  try {
    const sensorNodes = ['glacier_lake_01', 'glacier_lake_02', 'glacier_lake_03'];
    const allInsights = [];

    for (const nodeId of sensorNodes) {
      try {
        const response = await axios.get(`${API_URL}/api/sensor/node/${nodeId}?limit=50`);

        if (response.data.success && response.data.readings && response.data.readings.length > 0) {
          const readings = response.data.readings;
          const insights = generateMLInsights(readings, nodeId);
          allInsights.push(insights);
        }
      } catch (error) {
        console.error(`Error getting insights for ${nodeId}:`, error.message);
      }
    }

    res.json({
      success: true,
      count: allInsights.length,
      insights: allInsights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ML insights error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ml/summary
 * Get aggregated ML summary across all nodes
 */
router.get('/summary', async (req, res) => {
  try {
    const sensorNodes = ['glacier_lake_01', 'glacier_lake_02', 'glacier_lake_03'];
    const allInsights = [];

    for (const nodeId of sensorNodes) {
      try {
        const response = await axios.get(`${API_URL}/api/sensor/node/${nodeId}?limit=50`);

        if (response.data.success && response.data.readings && response.data.readings.length > 0) {
          const readings = response.data.readings;
          const insights = generateMLInsights(readings, nodeId);
          allInsights.push(insights);
        }
      } catch (error) {
        console.error(`Error getting insights for ${nodeId}:`, error.message);
      }
    }

    // Calculate summary statistics
    const anomalyCount = allInsights.filter(i => i.anomalyDetection?.isAnomaly).length;
    const highRiskNodes = allInsights.filter(i => i.mlRiskLevel === 'HIGH' || i.mlRiskLevel === 'CRITICAL').length;
    const avgRiskScore = allInsights.length > 0
      ? (allInsights.reduce((sum, i) => sum + parseFloat(i.mlRiskScore), 0) / allInsights.length).toFixed(1)
      : 0;

    const highestRiskNode = allInsights.length > 0
      ? allInsights.reduce((max, insight) => {
          return parseFloat(insight.mlRiskScore) > parseFloat(max.mlRiskScore) ? insight : max;
        }, allInsights[0])
      : { nodeId: 'N/A', mlRiskScore: 0, mlRiskLevel: 'N/A' };

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalNodes: sensorNodes.length,
        nodesAnalyzed: allInsights.length,
        anomaliesDetected: anomalyCount,
        highRiskNodes,
        averageRiskScore: avgRiskScore,
        highestRiskNode: {
          nodeId: highestRiskNode.nodeId,
          riskScore: highestRiskNode.mlRiskScore,
          riskLevel: highestRiskNode.mlRiskLevel
        }
      },
      nodeInsights: allInsights
    });

  } catch (error) {
    console.error('ML summary error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
