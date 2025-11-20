const moment = require('moment');

class AlertEngine {
  constructor() {
    this.thresholds = {
      temperature: parseFloat(process.env.TEMP_THRESHOLD) || 10,
      seismic: parseFloat(process.env.SEISMIC_THRESHOLD) || 0.5,
      waterLevelIncrease: parseFloat(process.env.WATER_LEVEL_INCREASE_THRESHOLD) || 20
    };

    this.sensorHistory = {};
  }

  /**
   * Analyze sensor data and determine alert level
   * @param {Object} sensorData - Current sensor reading
   * @param {Array} historicalData - Last 24 hours of data
   * @returns {Object} Alert information
   * OPTIMIZED: More efficient history management
   */
  analyzeSensorData(sensorData, historicalData = []) {
    const { node_id, temperature, seismic_activity, water_level } = sensorData;

    // Store in history
    if (!this.sensorHistory[node_id]) {
      this.sensorHistory[node_id] = [];
    }
    this.sensorHistory[node_id].push(sensorData);

    // Keep only last 100 readings - use slice instead of shift for better performance
    if (this.sensorHistory[node_id].length > 100) {
      this.sensorHistory[node_id] = this.sensorHistory[node_id].slice(-100);
    }

    const riskFactors = [];
    let riskScore = 0;
    let riskLevel = 'LOW';

    // 1. Temperature Analysis
    if (temperature > this.thresholds.temperature) {
      riskFactors.push(`High temperature: ${temperature}°C (threshold: ${this.thresholds.temperature}°C)`);
      riskScore += 30;
    }

    // 2. Seismic Activity Analysis
    if (seismic_activity > this.thresholds.seismic) {
      riskFactors.push(`Elevated seismic activity: ${seismic_activity} (threshold: ${this.thresholds.seismic})`);
      riskScore += 35;
    }

    // 3. Water Level Trend Analysis
    const waterLevelTrend = this.analyzeWaterLevelTrend(node_id, water_level);
    if (waterLevelTrend.isRapidIncrease) {
      riskFactors.push(`Rapid water level increase: ${waterLevelTrend.percentageIncrease.toFixed(1)}% in 1 hour`);
      riskScore += 35;
    }

    // 4. Combined Risk Assessment (Critical condition)
    if (temperature > this.thresholds.temperature &&
        seismic_activity > this.thresholds.seismic &&
        waterLevelTrend.isRapidIncrease) {
      riskFactors.push('⚠️ COMBINED RISK: All indicators showing dangerous levels');
      riskScore += 40; // Bonus for combined risk
    }

    // Determine risk level
    if (riskScore >= 70) {
      riskLevel = 'CRITICAL';
    } else if (riskScore >= 40) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 20) {
      riskLevel = 'MEDIUM';
    }

    return {
      node_id,
      timestamp: new Date().toISOString(),
      riskLevel,
      riskScore,
      riskFactors,
      metrics: {
        temperature,
        seismic_activity,
        water_level,
        waterLevelTrend: waterLevelTrend.percentageIncrease
      },
      shouldAlert: riskLevel === 'CRITICAL' || riskLevel === 'HIGH',
      alertMessage: this.generateAlertMessage(riskLevel, node_id, riskFactors)
    };
  }

  /**
   * Analyze water level trend
   */
  analyzeWaterLevelTrend(nodeId, currentLevel) {
    const history = this.sensorHistory[nodeId] || [];

    if (history.length < 2) {
      return { isRapidIncrease: false, percentageIncrease: 0 };
    }

    // Get reading from ~1 hour ago (assuming 1 reading per minute, 60 readings = 1 hour)
    const lookbackIndex = Math.min(60, history.length - 1);
    const previousLevel = history[history.length - lookbackIndex].water_level;

    const percentageIncrease = ((currentLevel - previousLevel) / previousLevel) * 100;

    return {
      isRapidIncrease: percentageIncrease >= this.thresholds.waterLevelIncrease,
      percentageIncrease
    };
  }

  /**
   * Generate human-readable alert message
   */
  generateAlertMessage(riskLevel, nodeId, riskFactors) {
    const messages = {
      CRITICAL: `🚨 CRITICAL GLOF ALERT at ${nodeId}! Immediate evacuation recommended. ${riskFactors.join('. ')}`,
      HIGH: `⚠️ HIGH RISK detected at ${nodeId}. Prepare for potential evacuation. ${riskFactors.join('. ')}`,
      MEDIUM: `⚡ MEDIUM RISK at ${nodeId}. Monitor situation closely. ${riskFactors.join('. ')}`,
      LOW: `✅ Normal conditions at ${nodeId}`
    };

    return messages[riskLevel] || messages.LOW;
  }

  /**
   * Get Urdu translation of alert
   */
  getUrduAlert(alertMessage, riskLevel) {
    const urduMessages = {
      CRITICAL: `🚨 انتہائی خطرناک صورتحال! فوری طور پر محفوظ مقام پر چلے جائیں۔`,
      HIGH: `⚠️ خطرہ! محفوظ جگہ کی تیاری کریں۔`,
      MEDIUM: `⚡ احتیاط! صورتحال کی نگرانی کریں۔`,
      LOW: `✅ صورتحال محفوظ ہے`
    };

    return urduMessages[riskLevel] || urduMessages.LOW;
  }

  /**
   * Reset alert engine - clear all sensor history
   * Used when switching from test mode to real-time mode
   */
  reset() {
    console.log('🔄 Resetting Alert Engine sensor history...');
    this.sensorHistory = {};
    console.log('✅ Alert Engine reset complete');
  }
}

module.exports = new AlertEngine();
