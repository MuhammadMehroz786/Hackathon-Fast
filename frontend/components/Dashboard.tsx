import { memo, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Thermometer, Activity, Droplets } from 'lucide-react'

interface DashboardProps {
  nodes: any[]
  sensorUpdates: any[]
  language: 'en' | 'ur' | 'bs'
}

function Dashboard({ nodes, sensorUpdates, language }: DashboardProps) {
  // Memoize average metrics calculation to avoid recalculating on every render
  const avgMetrics = useMemo(() => {
    if (nodes.length === 0) return null

    return {
      temperature: nodes.reduce((sum, node) => sum + (node.latest_reading?.temperature || 0), 0) / nodes.length,
      seismic: nodes.reduce((sum, node) => sum + (node.latest_reading?.seismic_activity || 0), 0) / nodes.length,
      waterLevel: nodes.reduce((sum, node) => sum + (node.latest_reading?.water_level || 0), 0) / nodes.length,
    }
  }, [nodes])

  // Memoize chart data preparation - only recalculate when sensorUpdates changes
  const chartData = useMemo(() => {
    return sensorUpdates.slice(-60).reduce((acc: any[], update, index) => {
      const timeIndex = Math.floor(index / 3) // Group every 3 updates (one from each sensor)
      if (!acc[timeIndex]) {
        acc[timeIndex] = {
          time: timeIndex,
          temperatures: [],
          seismics: [],
          waterLevels: []
        }
      }
      acc[timeIndex].temperatures.push(update.temperature)
      acc[timeIndex].seismics.push(update.seismic_activity * 10)
      acc[timeIndex].waterLevels.push(update.water_level / 10)
      return acc
    }, []).map(item => ({
      time: item.time,
      temperature: Number((item.temperatures.reduce((a: number, b: number) => a + b, 0) / item.temperatures.length).toFixed(1)),
      seismic: Number((item.seismics.reduce((a: number, b: number) => a + b, 0) / item.seismics.length).toFixed(2)),
      waterLevel: Number((item.waterLevels.reduce((a: number, b: number) => a + b, 0) / item.waterLevels.length).toFixed(1)),
    })).slice(-20)
  }, [sensorUpdates])

  return (
    <div className="glass-effect rounded-2xl shadow-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {language === 'en' ? 'Real-Time Analytics' : language === 'ur' ? 'حقیقی وقت کا تجزیہ' : 'وقتے تجزیہ'}
        </h2>
        <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
          {language === 'en' ? 'All Locations Average' : language === 'ur' ? 'تمام مقامات کی اوسط' : 'سبے جگہ اوسط'}
        </div>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Temperature */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-xl border-2 border-red-200 shadow-md card-hover relative overflow-hidden">
          <div className="flex items-center space-x-2 mb-3">
            <Thermometer className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-800">
              {language === 'en' ? 'Temperature' : language === 'ur' ? 'درجہ حرارت' : 'گرمی'}
            </h3>
          </div>
          {avgMetrics && (
            <div>
              <p className="text-3xl font-bold text-red-600">
                {Number(avgMetrics.temperature).toFixed(1)}°C
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'en' ? 'All Locations' : language === 'ur' ? 'تمام مقامات' : 'سبے جگہ'}
              </p>
            </div>
          )}
        </div>

        {/* Seismic Activity */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-5 rounded-xl border-2 border-yellow-200 shadow-md card-hover relative overflow-hidden">
          <div className="flex items-center space-x-2 mb-3">
            <Activity className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-800">
              {language === 'en' ? 'Seismic Activity' : language === 'ur' ? 'زلزلے کی سرگرمی' : 'زلزلے سرگرمی'}
            </h3>
          </div>
          {avgMetrics && (
            <div>
              <p className="text-3xl font-bold text-yellow-600">
                {Number(avgMetrics.seismic).toFixed(3)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'en' ? 'All Locations' : language === 'ur' ? 'تمام مقامات' : 'سبے جگہ'}
              </p>
            </div>
          )}
        </div>

        {/* Water Level */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200 shadow-md card-hover relative overflow-hidden">
          <div className="flex items-center space-x-2 mb-3">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">
              {language === 'en' ? 'Water Level' : language === 'ur' ? 'پانی کی سطح' : 'چلنگ سطح'}
            </h3>
          </div>
          {avgMetrics && (
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {Number(avgMetrics.waterLevel).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'en' ? 'All Locations (cm)' : language === 'ur' ? 'تمام مقامات (سینٹی میٹر)' : 'سبے جگہ (سم)'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Line Chart */}
      {chartData.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {language === 'en' ? 'Live Sensor Trends' : language === 'ur' ? 'براہ راست سینسر ڈیٹا' : 'زندہ سنسر رجحانات'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'en' ? 'Average from Hunza, Chitral & Skardu' : language === 'ur' ? 'ہنزہ، چترال اور سکردو کی اوسط' : 'ہنزہ، چترال ہن سکردو اوسط'}
              </p>
            </div>
            <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              Last {chartData.length} readings
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                name="Avg Temp (°C)"
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="seismic"
                stroke="#eab308"
                name="Avg Seismic (x10)"
                strokeWidth={3}
                dot={{ fill: '#eab308', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="waterLevel"
                stroke="#3b82f6"
                name="Avg Water (cm/10)"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default memo(Dashboard)
