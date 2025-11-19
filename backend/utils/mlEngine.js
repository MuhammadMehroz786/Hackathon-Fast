/**
 * Simple ML Engine for GLOF Prediction
 * Uses statistical methods for anomaly detection and trend prediction
 */

/**
 * Calculate Z-score for anomaly detection
 */
function calculateZScore(value, mean, stdDev) {
  if (stdDev === 0) return 0;
  return Math.abs((value - mean) / stdDev);
}

/**
 * Calculate statistics for an array of values in a single pass
 */
function calculateStats(values) {
  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = values.reduce((sq, val) => sq + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  return { mean, stdDev };
}

/**
 * Detect anomalies in sensor readings using Z-score method
 * OPTIMIZED: Single pass through data for all statistics
 */
function detectAnomalies(readings, threshold = 2.5) {
  if (!readings || readings.length < 3) {
    return { isAnomaly: false, confidence: 0, details: 'Insufficient data', anomalies: [] };
  }

  // Calculate statistics in one pass for all parameters
  const temps = readings.map(r => r.temperature);
  const seismic = readings.map(r => r.seismic_activity);
  const waterLevels = readings.map(r => r.water_level);

  const tempStats = calculateStats(temps);
  const seismicStats = calculateStats(seismic);
  const waterStats = calculateStats(waterLevels);

  // Check latest reading for anomalies
  const latest = readings[readings.length - 1];
  const tempZScore = calculateZScore(latest.temperature, tempStats.mean, tempStats.stdDev);
  const seismicZScore = calculateZScore(latest.seismic_activity, seismicStats.mean, seismicStats.stdDev);
  const waterZScore = calculateZScore(latest.water_level, waterStats.mean, waterStats.stdDev);

  const maxZScore = Math.max(tempZScore, seismicZScore, waterZScore);
  const isAnomaly = maxZScore > threshold;

  // Identify which parameter is anomalous
  const anomalies = [];
  if (tempZScore > threshold) anomalies.push({ parameter: 'temperature', zScore: tempZScore.toFixed(2) });
  if (seismicZScore > threshold) anomalies.push({ parameter: 'seismic_activity', zScore: seismicZScore.toFixed(2) });
  if (waterZScore > threshold) anomalies.push({ parameter: 'water_level', zScore: waterZScore.toFixed(2) });

  return {
    isAnomaly,
    confidence: Math.min(maxZScore / 3 * 100, 100).toFixed(1), // Convert to percentage
    maxZScore: maxZScore.toFixed(2),
    anomalies,
    details: isAnomaly
      ? `Anomaly detected in ${anomalies.map(a => a.parameter).join(', ')}`
      : 'Normal pattern detected'
  };
}

/**
 * Simple linear regression for trend prediction
 */
function linearRegression(xValues, yValues) {
  const n = xValues.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Predict future values using linear regression
 */
function predictTrend(readings, parameter, stepsAhead = 6) {
  if (!readings || readings.length < 3) {
    return { trend: 'unknown', predictions: [], confidence: 0 };
  }

  // Use last 20 readings for prediction
  const recentReadings = readings.slice(-20);
  const xValues = recentReadings.map((_, i) => i);
  const yValues = recentReadings.map(r => r[parameter]);

  // Calculate linear regression
  const { slope, intercept } = linearRegression(xValues, yValues);

  // Generate predictions
  const predictions = [];
  const lastIndex = xValues[xValues.length - 1];
  for (let i = 1; i <= stepsAhead; i++) {
    const predictedValue = slope * (lastIndex + i) + intercept;
    predictions.push({
      step: i,
      value: parseFloat(predictedValue.toFixed(2)),
      timeAhead: `+${i * 10}min` // Assuming 10-minute intervals
    });
  }

  // Determine trend direction
  const trend = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';

  // Calculate confidence based on R-squared
  const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
  const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssRes = yValues.reduce((sum, y, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const rSquared = 1 - (ssRes / ssTot);
  const confidence = Math.max(0, Math.min(100, rSquared * 100)).toFixed(1);

  return {
    trend,
    slope: slope.toFixed(4),
    predictions,
    confidence,
    currentValue: yValues[yValues.length - 1]
  };
}

/**
 * Calculate risk score using ML-based approach
 */
function calculateMLRiskScore(readings, nodeId) {
  if (!readings || readings.length < 3) {
    return { riskScore: 0, riskLevel: 'UNKNOWN', factors: [] };
  }

  const latest = readings[readings.length - 1];
  const anomalyResult = detectAnomalies(readings, 1.8); // More sensitive threshold (was 2.5)
  const tempTrend = predictTrend(readings, 'temperature');
  const waterTrend = predictTrend(readings, 'water_level');
  const seismicTrend = predictTrend(readings, 'seismic_activity');

  // Calculate risk factors
  let riskScore = 0;
  const factors = [];

  // Anomaly detection factor (0-35 points) - increased weight
  if (anomalyResult.isAnomaly) {
    const anomalyPoints = Math.min(35, parseFloat(anomalyResult.confidence) * 0.35);
    riskScore += anomalyPoints;
    factors.push({
      factor: 'Anomaly Detected',
      impact: anomalyPoints.toFixed(1),
      description: anomalyResult.details
    });
  }

  // Current temperature risk (0-25 points) - based on absolute value
  if (latest.temperature > -5) {
    const tempPoints = Math.min(25, (latest.temperature + 5) * 1.5);
    riskScore += tempPoints;
    factors.push({
      factor: 'Elevated Temperature',
      impact: tempPoints.toFixed(1),
      description: `Temperature at ${latest.temperature.toFixed(1)}°C (threshold: -5°C)`
    });
  }

  // Temperature trend factor (0-20 points) - additional if increasing
  if (tempTrend.trend === 'increasing' && parseFloat(tempTrend.slope) > 0.5) {
    const trendPoints = 20;
    riskScore += trendPoints;
    factors.push({
      factor: 'Rising Temperature Trend',
      impact: trendPoints,
      description: `Temp increasing at ${tempTrend.slope}°C per reading`
    });
  }

  // Current water level risk (0-25 points)
  if (latest.water_level > 280) {
    const waterPoints = Math.min(25, (latest.water_level - 280) * 0.15);
    riskScore += waterPoints;
    factors.push({
      factor: 'Elevated Water Level',
      impact: waterPoints.toFixed(1),
      description: `Water level at ${latest.water_level.toFixed(1)}cm (threshold: 280cm)`
    });
  }

  // Water level trend factor (0-20 points)
  if (waterTrend.trend === 'increasing' && parseFloat(waterTrend.slope) > 1) {
    const waterTrendPoints = 20;
    riskScore += waterTrendPoints;
    factors.push({
      factor: 'Rising Water Level',
      impact: waterTrendPoints,
      description: `Water level increasing at ${waterTrend.slope}cm per reading`
    });
  }

  // Current seismic activity (0-25 points)
  if (latest.seismic_activity > 0.3) {
    const seismicPoints = Math.min(25, (latest.seismic_activity - 0.3) * 50);
    riskScore += seismicPoints;
    factors.push({
      factor: 'Elevated Seismic Activity',
      impact: seismicPoints.toFixed(1),
      description: `Seismic activity at ${latest.seismic_activity.toFixed(3)} (threshold: 0.3)`
    });
  }

  // Seismic trend factor (0-15 points)
  if (seismicTrend.trend === 'increasing' || latest.seismic_activity > 0.5) {
    const seismicTrendPoints = 15;
    riskScore += seismicTrendPoints;
    factors.push({
      factor: 'Increasing Seismic Trend',
      impact: seismicTrendPoints,
      description: `Seismic trend: ${seismicTrend.trend}`
    });
  }

  // Determine risk level based on score (more sensitive thresholds)
  let riskLevel = 'LOW';
  if (riskScore >= 60) riskLevel = 'CRITICAL';
  else if (riskScore >= 40) riskLevel = 'HIGH';
  else if (riskScore >= 20) riskLevel = 'MEDIUM';

  return {
    riskScore: Math.min(100, riskScore).toFixed(1),
    riskLevel,
    factors,
    anomalyDetection: anomalyResult,
    trends: {
      temperature: tempTrend,
      waterLevel: waterTrend,
      seismicActivity: seismicTrend
    }
  };
}

/**
 * Generate comprehensive ML insights for a node
 */
function generateMLInsights(readings, nodeId) {
  if (!readings || readings.length < 3) {
    return {
      success: false,
      message: 'Insufficient data for ML analysis',
      dataPoints: readings?.length || 0
    };
  }

  const mlRisk = calculateMLRiskScore(readings, nodeId);
  const anomalyResult = mlRisk.anomalyDetection;
  const trends = mlRisk.trends;

  return {
    success: true,
    nodeId,
    dataPoints: readings.length,
    timestamp: new Date().toISOString(),
    mlRiskScore: mlRisk.riskScore,
    mlRiskLevel: mlRisk.riskLevel,
    riskFactors: mlRisk.factors,
    anomalyDetection: {
      isAnomaly: anomalyResult?.isAnomaly ?? false,
      confidence: anomalyResult?.confidence ?? 0,
      details: anomalyResult?.details ?? 'No anomaly data',
      anomalies: anomalyResult?.anomalies ?? []
    },
    predictions: {
      temperature: {
        trend: trends.temperature.trend,
        confidence: trends.temperature.confidence,
        next6Hours: trends.temperature.predictions
      },
      waterLevel: {
        trend: trends.waterLevel.trend,
        confidence: trends.waterLevel.confidence,
        next6Hours: trends.waterLevel.predictions
      },
      seismicActivity: {
        trend: trends.seismicActivity.trend,
        confidence: trends.seismicActivity.confidence,
        next6Hours: trends.seismicActivity.predictions
      }
    },
    recommendation: getRecommendation(mlRisk.riskLevel, anomalyResult.isAnomaly)
  };
}

/**
 * Get recommendation based on risk level
 */
function getRecommendation(riskLevel, isAnomaly) {
  if (riskLevel === 'CRITICAL') {
    return 'IMMEDIATE ACTION REQUIRED: Evacuate downstream areas. GLOF imminent.';
  } else if (riskLevel === 'HIGH') {
    return 'HIGH ALERT: Prepare evacuation plans. Monitor continuously.';
  } else if (riskLevel === 'MEDIUM' || isAnomaly) {
    return 'CAUTION: Increased monitoring recommended. Alert authorities.';
  } else {
    return 'Normal conditions. Continue routine monitoring.';
  }
}

module.exports = {
  detectAnomalies,
  predictTrend,
  calculateMLRiskScore,
  generateMLInsights
};
