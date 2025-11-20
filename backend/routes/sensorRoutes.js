const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const alertEngine = require('../utils/alertEngine');
const { sendAlertEmail } = require('../utils/emailService');

// In-memory storage (fallback if Firebase not configured)
let sensorDataStore = [];
let alertStore = [];

// Simple in-memory cache for nodes endpoint
let nodesCache = null;
let nodesCacheTime = null;
const CACHE_DURATION = 2000; // 2 seconds cache

/**
 * POST /api/sensor/data
 * Receive sensor data from IoT devices
 */
router.post('/data', async (req, res) => {
  try {
    const sensorData = {
      ...req.body,
      timestamp: new Date().toISOString(),
      received_at: Date.now()
    };

    // Validate required fields
    const requiredFields = ['node_id', 'temperature', 'seismic_activity', 'water_level'];
    const missingFields = requiredFields.filter(field => sensorData[field] === undefined);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: missingFields
      });
    }

    // Store in Firebase or memory
    if (db) {
      await db.ref(`sensor_data/${sensorData.node_id}`).push(sensorData);
    } else {
      sensorDataStore.push(sensorData);
      // Keep only last 1000 readings
      if (sensorDataStore.length > 1000) {
        sensorDataStore = sensorDataStore.slice(-1000);
      }
    }

    // Run through alert engine
    const alertAnalysis = alertEngine.analyzeSensorData(sensorData);

    // If high risk, save alert
    if (alertAnalysis.shouldAlert) {
      const alert = {
        ...alertAnalysis,
        created_at: Date.now()
      };

      if (db) {
        await db.ref('alerts').push(alert);
      } else {
        alertStore.push(alert);
      }

      // Send email alert (async, don't await to avoid blocking)
      const emailData = {
        nodeId: sensorData.node_id,
        riskLevel: alertAnalysis.riskLevel,
        temperature: sensorData.temperature,
        seismicActivity: sensorData.seismic_activity,
        waterLevel: sensorData.water_level,
        timestamp: sensorData.timestamp,
        message: alertAnalysis.alertMessage
      };

      // Send emails in all three languages
      sendAlertEmail(emailData, 'en').catch(err => console.error('Email error (EN):', err.message));
      sendAlertEmail(emailData, 'ur').catch(err => console.error('Email error (UR):', err.message));
      sendAlertEmail(emailData, 'bs').catch(err => console.error('Email error (BS):', err.message));

      // Emit real-time alert via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.emit('new_alert', alert);
        io.emit('sensor_update', { ...sensorData, alert: alertAnalysis });
      }
    } else {
      // Still emit sensor update
      const io = req.app.get('io');
      if (io) {
        io.emit('sensor_update', { ...sensorData, alert: alertAnalysis });
      }
    }

    // Invalidate cache when new data arrives
    nodesCache = null;
    nodesCacheTime = null;

    res.status(201).json({
      success: true,
      message: 'Sensor data received',
      alert: alertAnalysis
    });

  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sensor/nodes
 * Get all sensor nodes with their latest data
 * OPTIMIZED: Uses in-memory cache to reduce DB queries
 */
router.get('/nodes', async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (nodesCache && nodesCacheTime && (now - nodesCacheTime) < CACHE_DURATION) {
      return res.json(nodesCache);
    }

    let nodes = [];

    if (db) {
      const snapshot = await db.ref('sensor_data').once('value');
      const data = snapshot.val();

      if (data) {
        nodes = Object.keys(data).map(nodeId => {
          const readings = Object.values(data[nodeId]);
          const latest = readings[readings.length - 1];
          return {
            node_id: nodeId,
            latest_reading: latest,
            total_readings: readings.length
          };
        });
      }
    } else {
      // Group by node_id
      const nodeMap = {};
      sensorDataStore.forEach(reading => {
        if (!nodeMap[reading.node_id]) {
          nodeMap[reading.node_id] = [];
        }
        nodeMap[reading.node_id].push(reading);
      });

      nodes = Object.keys(nodeMap).map(nodeId => ({
        node_id: nodeId,
        latest_reading: nodeMap[nodeId][nodeMap[nodeId].length - 1],
        total_readings: nodeMap[nodeId].length
      }));
    }

    // Update cache
    const response = { success: true, nodes };
    nodesCache = response;
    nodesCacheTime = now;

    res.json(response);

  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sensor/node/:nodeId
 * Get specific node data with history
 */
router.get('/node/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    let readings = [];

    if (db) {
      const snapshot = await db.ref(`sensor_data/${nodeId}`)
        .limitToLast(limit)
        .once('value');

      const data = snapshot.val();
      if (data) {
        readings = Object.values(data);
      }
    } else {
      readings = sensorDataStore
        .filter(r => r.node_id === nodeId)
        .slice(-limit);
    }

    res.json({
      success: true,
      node_id: nodeId,
      readings,
      count: readings.length
    });

  } catch (error) {
    console.error('Error fetching node data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sensor/reset
 * Reset all sensor data and alerts (useful when switching from test mode to real-time)
 */
router.post('/reset', async (req, res) => {
  try {
    console.log('🔄 Resetting all sensor data and alerts...');

    // Clear in-memory storage
    sensorDataStore = [];
    alertStore = [];

    // Invalidate cache
    nodesCache = null;
    nodesCacheTime = null;

    // Reset alert engine history
    if (alertEngine && alertEngine.reset) {
      alertEngine.reset();
    }

    // Clear Firebase data if configured
    if (db) {
      await db.ref('sensor_data').remove();
      await db.ref('alerts').remove();
      console.log('✅ Firebase data cleared');
    }

    // Emit reset event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('system_reset', { timestamp: new Date().toISOString() });
      console.log('📡 Reset event broadcasted to all clients');
    }

    console.log('✅ System reset complete - ready for real-time data');

    res.json({
      success: true,
      message: 'System reset successfully - all test data cleared',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error resetting system:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset system',
      details: error.message
    });
  }
});

module.exports = router;
