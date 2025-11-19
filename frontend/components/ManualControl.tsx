'use client'

import { useState } from 'react'
import { Sliders, Send, RotateCcw, Gauge, Activity, Droplets, Battery, Signal } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface ManualControlProps {
  language: 'en' | 'ur' | 'bs'
  onDataSent?: () => void
}

const nodeLocations = {
  'glacier_lake_01': 'Hunza Valley',
  'glacier_lake_02': 'Chitral',
  'glacier_lake_03': 'Skardu'
}

export default function ManualControl({ language, onDataSent }: ManualControlProps) {
  const [selectedNode, setSelectedNode] = useState('glacier_lake_01')
  const [temperature, setTemperature] = useState(-10)
  const [seismicActivity, setSeismicActivity] = useState(0.2)
  const [waterLevel, setWaterLevel] = useState(250)
  const [battery, setBattery] = useState(85)
  const [signalStrength, setSignalStrength] = useState(80)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)

  const resetToDefaults = () => {
    setTemperature(-10)
    setSeismicActivity(0.2)
    setWaterLevel(250)
    setBattery(85)
    setSignalStrength(80)
    setResult(null)
  }

  const sendCustomData = async () => {
    setSending(true)
    setResult(null)

    try {
      const customData = {
        node_id: selectedNode,
        temperature: parseFloat(temperature.toFixed(2)),
        seismic_activity: parseFloat(seismicActivity.toFixed(3)),
        water_level: parseFloat(waterLevel.toFixed(2)),
        battery: Math.floor(battery),
        signal_strength: Math.floor(signalStrength),
        source: 'manual_control'
      }

      const response = await axios.post(`${API_URL}/api/sensor/data`, customData)
      setResult({ success: true, data: response.data })
      console.log('✅ Custom data sent:', response.data)

      // Trigger ML refresh
      if (onDataSent) {
        onDataSent()
      }
    } catch (error: any) {
      console.error('❌ Failed to send custom data:', error)
      setResult({ success: false, error: error.message })
    } finally {
      setSending(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'text-red-700 bg-red-100 border-red-300'
      case 'HIGH':
        return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'MEDIUM':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      default:
        return 'text-green-700 bg-green-100 border-green-300'
    }
  }

  return (
    <div className="glass-effect rounded-2xl shadow-xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <Sliders className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {language === 'en' ? 'Manual Control' : 'دستی کنٹرول'}
            </h2>
            <p className="text-sm text-gray-600">
              {language === 'en' ? 'Send custom sensor data' : 'حسب ضرورت سینسر ڈیٹا بھیجیں'}
            </p>
          </div>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border-2 border-gray-300 transition-all duration-300 hover:scale-105"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {language === 'en' ? 'Reset' : 'ری سیٹ'}
          </span>
        </button>
      </div>

      {/* Node Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {language === 'en' ? 'Select Sensor Location' : 'سینسر کی جگہ منتخب کریں'}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(nodeLocations).map(([nodeId, location]) => (
            <button
              key={nodeId}
              onClick={() => setSelectedNode(nodeId)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                selectedNode === nodeId
                  ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-400 shadow-lg'
                  : 'bg-white border-gray-200 hover:border-cyan-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${selectedNode === nodeId ? 'bg-cyan-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <div className="text-left">
                  <p className="text-xs text-gray-600">{nodeId}</p>
                  <p className="font-bold text-sm text-gray-800">{location}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6 mb-6">
        {/* Temperature */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-blue-600" />
              <label className="font-semibold text-gray-800">
                {language === 'en' ? 'Temperature' : 'درجہ حرارت'}
              </label>
            </div>
            <div className="text-2xl font-bold text-blue-700">{temperature.toFixed(1)}°C</div>
          </div>
          <input
            type="range"
            min="-30"
            max="20"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-blue-200 to-blue-400 accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>-30°C (Critical)</span>
            <span>20°C (Danger)</span>
          </div>
        </div>

        {/* Seismic Activity */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <label className="font-semibold text-gray-800">
                {language === 'en' ? 'Seismic Activity' : 'زلزلہ کی سرگرمی'}
              </label>
            </div>
            <div className="text-2xl font-bold text-orange-700">{seismicActivity.toFixed(3)}</div>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.001"
            value={seismicActivity}
            onChange={(e) => setSeismicActivity(parseFloat(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-orange-200 to-red-400 accent-orange-600"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>0.0 (Stable)</span>
            <span>1.5 (High)</span>
          </div>
        </div>

        {/* Water Level */}
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-5 border-2 border-cyan-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-cyan-600" />
              <label className="font-semibold text-gray-800">
                {language === 'en' ? 'Water Level' : 'پانی کی سطح'}
              </label>
            </div>
            <div className="text-2xl font-bold text-cyan-700">{waterLevel.toFixed(0)} cm</div>
          </div>
          <input
            type="range"
            min="100"
            max="500"
            step="1"
            value={waterLevel}
            onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-cyan-200 to-teal-400 accent-cyan-600"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>100 cm (Low)</span>
            <span>500 cm (High)</span>
          </div>
        </div>

        {/* Battery & Signal in Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Battery */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Battery className="w-4 h-4 text-green-600" />
                <label className="font-semibold text-sm text-gray-800">
                  {language === 'en' ? 'Battery' : 'بیٹری'}
                </label>
              </div>
              <div className="text-xl font-bold text-green-700">{battery}%</div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={battery}
              onChange={(e) => setBattery(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-green-200 to-emerald-400 accent-green-600"
            />
          </div>

          {/* Signal Strength */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Signal className="w-4 h-4 text-purple-600" />
                <label className="font-semibold text-sm text-gray-800">
                  {language === 'en' ? 'Signal' : 'سگنل'}
                </label>
              </div>
              <div className="text-xl font-bold text-purple-700">{signalStrength}%</div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={signalStrength}
              onChange={(e) => setSignalStrength(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-purple-200 to-indigo-400 accent-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={sendCustomData}
        disabled={sending}
        className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl border-2 border-cyan-400 shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {sending ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span className="text-lg font-bold">
              {language === 'en' ? 'Sending...' : 'بھیج رہے ہیں...'}
            </span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span className="text-lg font-bold">
              {language === 'en' ? 'Send Custom Data' : 'حسب ضرورت ڈیٹا بھیجیں'}
            </span>
          </>
        )}
      </button>

      {/* Result Display */}
      {result && (
        <div className={`mt-6 p-5 rounded-xl border-2 ${
          result.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2">
                {result.success
                  ? (language === 'en' ? 'Data Sent Successfully!' : 'ڈیٹا کامیابی سے بھیج دیا گیا!')
                  : (language === 'en' ? 'Failed to Send Data' : 'ڈیٹا بھیجنے میں ناکام')}
              </h4>
              {result.success && result.data.alert ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-700">Risk Level:</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-lg border-2 ${getRiskColor(result.data.alert.riskLevel)}`}>
                      {result.data.alert.riskLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Location:</span> {nodeLocations[selectedNode as keyof typeof nodeLocations]}
                  </p>
                  {result.data.alert.shouldAlert && (
                    <div className="mt-3 p-3 bg-orange-100 border-2 border-orange-300 rounded-lg">
                      <p className="text-sm font-bold text-orange-800">
                        ⚠️ {language === 'en' ? 'Alert Triggered!' : 'انتباہ شروع!'}
                      </p>
                      <p className="text-xs text-orange-700 mt-1">{result.data.alert.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-700">{result.error}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
