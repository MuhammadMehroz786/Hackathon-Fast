'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Zap, Activity } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface MLInsightsProps {
  language: 'en' | 'ur' | 'bs'
  refreshTrigger?: number
}

export default function MLInsights({ language, refreshTrigger }: MLInsightsProps) {
  const [mlSummary, setMlSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMLInsights = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ml/summary`)
      setMlSummary(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching ML insights:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMLInsights()
    // Refresh ML insights every 30 seconds
    const interval = setInterval(fetchMLInsights, 30000)
    return () => clearInterval(interval)
  }, [])

  // Refresh when trigger changes (when manual data or preset is sent)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('🔄 Refreshing ML insights due to manual data update')
      fetchMLInsights()
    }
  }, [refreshTrigger])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-600" />
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-blue-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'from-red-500 to-rose-600'
      case 'HIGH':
        return 'from-orange-500 to-amber-600'
      case 'MEDIUM':
        return 'from-yellow-500 to-amber-600'
      default:
        return 'from-green-500 to-emerald-600'
    }
  }

  const getRiskBgColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-200'
      case 'HIGH':
        return 'bg-orange-50 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-green-50 border-green-200'
    }
  }

  if (loading) {
    return (
      <div className="glass-effect rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (error || !mlSummary?.success) {
    return (
      <div className="glass-effect rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {language === 'en' ? 'ML Insights' : language === 'ur' ? 'ML تجزیات' : 'ایم ایل تجزیات'}
          </h2>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700 text-sm">
            {language === 'en'
              ? 'Unable to load ML insights. Please ensure sensor data is available.'
              : language === 'ur'
              ? 'ML تجزیات لوڈ نہیں ہو سکے۔'
              : 'ایم ایل تجزیات لوڈ بلا نایو۔ سنسر ڈیٹا مییور بلے۔'}
          </p>
        </div>
      </div>
    )
  }

  const { summary, nodeInsights } = mlSummary

  return (
    <div className="glass-effect rounded-2xl shadow-xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {language === 'en' ? 'ML-Powered Insights' : language === 'ur' ? 'ML سے چلنے والے تجزیات' : 'ایم ایل قوتے تجزیات'}
            </h2>
            <p className="text-sm text-gray-600">
              {language === 'en' ? 'AI-driven anomaly detection & prediction' : language === 'ur' ? 'AI پر مبنی غیر معمولی پتہ لگانا' : 'اے آئی مناسبتے غیر معمولی تفتیش'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
          <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
          <span className="text-sm font-semibold text-purple-700">
            {language === 'en' ? 'AI Active' : language === 'ur' ? 'AI فعال' : 'اے آئی فعالی'}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {language === 'en' ? 'Avg Risk Score' : language === 'ur' ? 'اوسط خطرہ' : 'اوسط خطرہ'}
            </span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-700">{summary.averageRiskScore}</div>
          <div className="text-xs text-gray-600 mt-1">{language === 'en' ? 'ML-based' : language === 'ur' ? 'ML پر مبنی' : 'ایم ایل مناسبتے'}</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {language === 'en' ? 'Anomalies' : language === 'ur' ? 'غیر معمولی' : 'غیر معمولی'}
            </span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-700">{summary.anomaliesDetected}</div>
          <div className="text-xs text-gray-600 mt-1">{language === 'en' ? 'Detected' : language === 'ur' ? 'پتہ چلا' : 'پتہ چلا'}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {language === 'en' ? 'High Risk' : language === 'ur' ? 'زیادہ خطرہ' : 'غپنے خطرہ'}
            </span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-700">{summary.highRiskNodes}</div>
          <div className="text-xs text-gray-600 mt-1">{language === 'en' ? 'Nodes' : language === 'ur' ? 'نوڈز' : 'نوڈزا'}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {language === 'en' ? 'Analyzed' : language === 'ur' ? 'تجزیہ شدہ' : 'تجزیہ شدہ'}
            </span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-700">{summary.nodesAnalyzed}/{summary.totalNodes}</div>
          <div className="text-xs text-gray-600 mt-1">{language === 'en' ? 'Nodes' : language === 'ur' ? 'نوڈز' : 'نوڈزا'}</div>
        </div>
      </div>

      {/* Highest Risk Node Alert */}
      {summary.highestRiskNode && parseFloat(summary.highestRiskNode.riskScore) > 30 && (
        <div className={`${getRiskBgColor(summary.highestRiskNode.riskLevel)} border-2 rounded-xl p-4 mb-6`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1">
                {language === 'en' ? 'Highest Risk Location' : language === 'ur' ? 'سب سے زیادہ خطرہ والی جگہ' : 'غپنے خطرہ جگہ'}
              </h3>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{summary.highestRiskNode.nodeId}</span>
                {' - '}
                <span className={`font-bold ${
                  summary.highestRiskNode.riskLevel === 'CRITICAL' ? 'text-red-700' :
                  summary.highestRiskNode.riskLevel === 'HIGH' ? 'text-orange-700' :
                  'text-yellow-700'
                }`}>
                  {summary.highestRiskNode.riskLevel} RISK
                </span>
                {' (ML Score: '}
                {summary.highestRiskNode.riskScore})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Node-by-Node Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          {language === 'en' ? 'Location-wise ML Analysis' : language === 'ur' ? 'مقام کے لحاظ سے ML تجزیہ' : 'جگہ مناسبتے ایم ایل تجزیہ'}
        </h3>
        {nodeInsights && nodeInsights.map((insight: any) => (
          <div
            key={insight.nodeId}
            className={`${getRiskBgColor(insight.mlRiskLevel)} border-2 rounded-xl p-5 transition-all duration-300 hover:shadow-lg`}
          >
            {/* Node Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`bg-gradient-to-br ${getRiskColor(insight.mlRiskLevel)} p-2 rounded-lg shadow-md`}>
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-base">{insight.nodeId}</h4>
                  <p className="text-xs text-gray-600">
                    {insight.dataPoints} {language === 'en' ? 'data points analyzed' : language === 'ur' ? 'ڈیٹا پوائنٹس کا تجزیہ' : 'ڈیٹا نقطہ تجزیہ'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{insight.mlRiskScore}</div>
                <div className={`text-xs font-bold px-2 py-1 rounded ${
                  insight.mlRiskLevel === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                  insight.mlRiskLevel === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                  insight.mlRiskLevel === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {insight.mlRiskLevel}
                </div>
              </div>
            </div>

            {/* Anomaly Detection */}
            {insight.anomalyDetection && (
              <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {language === 'en' ? 'Anomaly Detection' : language === 'ur' ? 'غیر معمولی پتہ لگانا' : 'غیر معمولی تفتیش'}
                  </span>
                  {insight.anomalyDetection.isAnomaly ? (
                    <span className="text-xs font-bold px-2 py-1 rounded bg-red-200 text-red-800">
                      ANOMALY
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-1 rounded bg-green-200 text-green-800">
                      NORMAL
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">{insight.anomalyDetection.details}</p>
                {insight.anomalyDetection.isAnomaly && (
                  <div className="mt-2 text-xs text-red-700 font-semibold">
                    Confidence: {insight.anomalyDetection.confidence}%
                  </div>
                )}
              </div>
            )}

            {/* Predictions */}
            {insight.predictions && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {/* Temperature Trend */}
                {insight.predictions.temperature && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">
                        {language === 'en' ? 'Temp Trend' : language === 'ur' ? 'درجہ حرارت' : 'گرمی رجحان'}
                      </span>
                      {getTrendIcon(insight.predictions.temperature.trend)}
                    </div>
                    <div className="text-sm font-bold text-gray-800 capitalize">
                      {insight.predictions.temperature.trend}
                    </div>
                    <div className="text-xs text-gray-600">
                      {language === 'en' ? 'Confidence' : language === 'ur' ? 'اعتماد' : 'اعتماد'}: {insight.predictions.temperature.confidence}%
                    </div>
                  </div>
                )}

                {/* Water Level Trend */}
                {insight.predictions.waterLevel && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">
                        {language === 'en' ? 'Water Trend' : language === 'ur' ? 'پانی کی سطح' : 'چلنگ رجحان'}
                      </span>
                      {getTrendIcon(insight.predictions.waterLevel.trend)}
                    </div>
                    <div className="text-sm font-bold text-gray-800 capitalize">
                      {insight.predictions.waterLevel.trend}
                    </div>
                    <div className="text-xs text-gray-600">
                      {language === 'en' ? 'Confidence' : language === 'ur' ? 'اعتماد' : 'اعتماد'}: {insight.predictions.waterLevel.confidence}%
                    </div>
                  </div>
                )}

                {/* Seismic Trend */}
                {insight.predictions.seismicActivity && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">
                        {language === 'en' ? 'Seismic Trend' : language === 'ur' ? 'زلزلہ' : 'زلزلے رجحان'}
                      </span>
                      {getTrendIcon(insight.predictions.seismicActivity.trend)}
                    </div>
                    <div className="text-sm font-bold text-gray-800 capitalize">
                      {insight.predictions.seismicActivity.trend}
                    </div>
                    <div className="text-xs text-gray-600">
                      {language === 'en' ? 'Confidence' : language === 'ur' ? 'اعتماد' : 'اعتماد'}: {insight.predictions.seismicActivity.confidence}%
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommendation */}
            {insight.recommendation && (
              <div className="bg-white bg-opacity-70 rounded-lg p-3 border-l-4 border-purple-500">
                <p className="text-xs font-semibold text-gray-800">{insight.recommendation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
