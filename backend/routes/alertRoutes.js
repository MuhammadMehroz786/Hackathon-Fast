const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// In-memory storage (fallback)
let alertStore = [];

/**
 * GET /api/alerts
 * Get all alerts with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { riskLevel, nodeId, limit = 50 } = req.query;
    let alerts = [];

    if (db) {
      const snapshot = await db.ref('alerts')
        .limitToLast(parseInt(limit))
        .once('value');

      const data = snapshot.val();
      if (data) {
        alerts = Object.values(data);
      }
    } else {
      alerts = alertStore.slice(-parseInt(limit));
    }

    // Filter by risk level
    if (riskLevel) {
      alerts = alerts.filter(a => a.riskLevel === riskLevel.toUpperCase());
    }

    // Filter by node
    if (nodeId) {
      alerts = alerts.filter(a => a.node_id === nodeId);
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      alerts,
      count: alerts.length
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/alerts/active
 * Get currently active critical/high alerts
 */
router.get('/active', async (req, res) => {
  try {
    let alerts = [];

    if (db) {
      const snapshot = await db.ref('alerts')
        .orderByChild('riskLevel')
        .limitToLast(100)
        .once('value');

      const data = snapshot.val();
      if (data) {
        alerts = Object.values(data);
      }
    } else {
      alerts = alertStore;
    }

    // Get only CRITICAL and HIGH from last 24 hours
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const activeAlerts = alerts.filter(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      return (alert.riskLevel === 'CRITICAL' || alert.riskLevel === 'HIGH') &&
             alertTime > twentyFourHoursAgo;
    });

    res.json({
      success: true,
      active_alerts: activeAlerts,
      count: activeAlerts.length
    });

  } catch (error) {
    console.error('Error fetching active alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/alerts/stats
 * Get alert statistics
 */
router.get('/stats', async (req, res) => {
  try {
    let alerts = [];

    if (db) {
      const snapshot = await db.ref('alerts').once('value');
      const data = snapshot.val();
      if (data) {
        alerts = Object.values(data);
      }
    } else {
      alerts = alertStore;
    }

    const stats = {
      total: alerts.length,
      by_level: {
        CRITICAL: alerts.filter(a => a.riskLevel === 'CRITICAL').length,
        HIGH: alerts.filter(a => a.riskLevel === 'HIGH').length,
        MEDIUM: alerts.filter(a => a.riskLevel === 'MEDIUM').length,
        LOW: alerts.filter(a => a.riskLevel === 'LOW').length
      },
      last_24h: alerts.filter(a => {
        const alertTime = new Date(a.timestamp).getTime();
        return alertTime > (Date.now() - 24 * 60 * 60 * 1000);
      }).length
    };

    res.json({ success: true, stats });

  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
