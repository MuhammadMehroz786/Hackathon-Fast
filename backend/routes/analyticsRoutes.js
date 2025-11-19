const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// In-memory storage (fallback)
let sensorDataStore = [];

/**
 * GET /api/analytics/overview
 * Get system overview and statistics
 */
router.get('/overview', async (req, res) => {
  try {
    let allData = [];

    if (db) {
      const snapshot = await db.ref('sensor_data').once('value');
      const data = snapshot.val();

      if (data) {
        Object.values(data).forEach(nodeData => {
          allData = allData.concat(Object.values(nodeData));
        });
      }
    } else {
      allData = sensorDataStore;
    }

    // Calculate statistics
    const nodeIds = [...new Set(allData.map(d => d.node_id))];
    const last24h = allData.filter(d => {
      const dataTime = new Date(d.timestamp).getTime();
      return dataTime > (Date.now() - 24 * 60 * 60 * 1000);
    });

    const avgTemp = last24h.length > 0
      ? last24h.reduce((sum, d) => sum + d.temperature, 0) / last24h.length
      : 0;

    const avgSeismic = last24h.length > 0
      ? last24h.reduce((sum, d) => sum + d.seismic_activity, 0) / last24h.length
      : 0;

    const overview = {
      total_nodes: nodeIds.length,
      total_readings: allData.length,
      readings_last_24h: last24h.length,
      active_nodes: nodeIds,
      average_metrics: {
        temperature: parseFloat(avgTemp.toFixed(2)),
        seismic_activity: parseFloat(avgSeismic.toFixed(3))
      },
      system_status: 'operational'
    };

    res.json({ success: true, overview });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/trends/:nodeId
 * Get trend data for a specific node
 */
router.get('/trends/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const hours = parseInt(req.query.hours) || 24;

    let readings = [];

    if (db) {
      const snapshot = await db.ref(`sensor_data/${nodeId}`)
        .limitToLast(hours * 60) // Assuming 1 reading per minute
        .once('value');

      const data = snapshot.val();
      if (data) {
        readings = Object.values(data);
      }
    } else {
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
      readings = sensorDataStore
        .filter(r => r.node_id === nodeId && r.received_at > cutoffTime);
    }

    // Group by hour
    const hourlyData = {};
    readings.forEach(reading => {
      const hour = new Date(reading.timestamp).toISOString().slice(0, 13);
      if (!hourlyData[hour]) {
        hourlyData[hour] = {
          temperatures: [],
          seismic: [],
          water_levels: []
        };
      }
      hourlyData[hour].temperatures.push(reading.temperature);
      hourlyData[hour].seismic.push(reading.seismic_activity);
      hourlyData[hour].water_levels.push(reading.water_level);
    });

    const trends = Object.keys(hourlyData).map(hour => ({
      timestamp: hour,
      avg_temperature: hourlyData[hour].temperatures.reduce((a, b) => a + b, 0) / hourlyData[hour].temperatures.length,
      avg_seismic: hourlyData[hour].seismic.reduce((a, b) => a + b, 0) / hourlyData[hour].seismic.length,
      avg_water_level: hourlyData[hour].water_levels.reduce((a, b) => a + b, 0) / hourlyData[hour].water_levels.length,
      readings_count: hourlyData[hour].temperatures.length
    }));

    res.json({
      success: true,
      node_id: nodeId,
      trends,
      period_hours: hours
    });

  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
