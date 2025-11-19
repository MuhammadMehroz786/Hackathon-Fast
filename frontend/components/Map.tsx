'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

interface MapProps {
  nodes: any[]
  alerts: any[]
  language: 'en' | 'ur' | 'bs'
}

// Mock locations for Northern Pakistan glacial lakes with manual positioning
const nodeLocations: { [key: string]: { lat: number; lng: number; name: string; x: number; y: number } } = {
  'glacier_lake_01': { lat: 36.3167, lng: 74.4500, name: 'Hunza Valley', x: 50, y: 30 },
  'glacier_lake_02': { lat: 35.8518, lng: 71.7846, name: 'Chitral', x: 25, y: 55 },
  'glacier_lake_03': { lat: 35.2971, lng: 75.6350, name: 'Skardu', x: 75, y: 55 },
}

export default function Map({ nodes, alerts, language }: MapProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const getRiskColor = (nodeId: string) => {
    // Get the node's latest reading to determine current risk level
    const node = nodes.find(n => n.node_id === nodeId)
    if (!node || !node.latest_reading) return 'bg-green-500'

    // Check if there's risk data in the latest reading
    const reading = node.latest_reading
    const temp = reading.temperature
    const seismic = reading.seismic_activity
    const waterLevel = reading.water_level

    // Simple risk determination based on thresholds
    // Critical: Very high temp, high seismic activity
    if (temp > 5 && seismic > 0.5) return 'bg-red-500 animate-pulse'
    if (temp > 10 || seismic > 0.6) return 'bg-red-500 animate-pulse'

    // High: Moderately high temp and seismic
    if (temp > 3 || seismic > 0.4) return 'bg-orange-500'

    // Medium: Slightly elevated
    if (temp > 0 || seismic > 0.3) return 'bg-yellow-500'

    // Low/Normal: Cold temps, low seismic
    return 'bg-green-500'
  }

  return (
    <div className="glass-effect rounded-2xl shadow-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {language === 'en' ? 'Sensor Network Map' : 'سینسر نیٹ ورک کا نقشہ'}
        </h2>
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">
            {nodes.length} {language === 'en' ? 'Active Locations' : 'فعال مقامات'}
          </span>
        </div>
      </div>

      {/* Simple map visualization - In production, use react-leaflet */}
      <div className="relative bg-gradient-to-br from-blue-200 via-green-100 to-emerald-200 rounded-2xl h-96 shadow-inner border-2 border-white/50">
        {/* Background "map" */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 300">
            {/* Simple mountain range illustration */}
            <path d="M0,250 L50,150 L100,180 L150,120 L200,140 L250,100 L300,130 L350,90 L400,110 L400,300 L0,300 Z"
                  fill="currentColor" className="text-gray-600"/>
            <path d="M0,270 L80,200 L160,220 L240,180 L320,200 L400,170 L400,300 L0,300 Z"
                  fill="currentColor" className="text-gray-500"/>
          </svg>
        </div>

        {/* Sensor nodes */}
        {nodes.map((node) => {
          const location = nodeLocations[node.node_id]
          if (!location) return null

          // Use manual positioning for better visibility
          const x = location.x
          const y = location.y

          return (
            <div
              key={node.node_id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-30"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => setSelectedNode(node.node_id)}
            >
              <div className="relative">
                <div className={`w-5 h-5 rounded-full ${getRiskColor(node.node_id)} border-3 border-white shadow-xl`} />
                {getRiskColor(node.node_id).includes('animate-pulse') && (
                  <div className="absolute top-0 left-0 w-5 h-5 rounded-full bg-red-500 animate-ping opacity-75" />
                )}
              </div>

              {/* Node info on hover */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-50">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                  <p className="font-bold">{location.name}</p>
                  <p className="text-gray-300">{node.node_id}</p>
                  {node.latest_reading && (
                    <div className="mt-1 pt-1 border-t border-gray-700">
                      <p>Temp: {Number(node.latest_reading.temperature).toFixed(1)}°C</p>
                      <p>Seismic: {Number(node.latest_reading.seismic_activity).toFixed(3)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 glass-effect rounded-xl shadow-2xl p-4 text-sm border border-white/30 z-20">
          <div className="font-bold mb-3 text-gray-800 flex items-center space-x-2">
            <div className="w-1 h-5 bg-gradient-to-b from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full"></div>
            <span>{language === 'en' ? 'Risk Level' : 'خطرے کی سطح'}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-md"></div>
              <span className="text-gray-700 font-medium">{language === 'en' ? 'Normal' : 'عام'}</span>
            </div>
            <div className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-yellow-50 transition-colors">
              <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-md"></div>
              <span className="text-gray-700 font-medium">{language === 'en' ? 'Medium' : 'درمیانہ'}</span>
            </div>
            <div className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors">
              <div className="w-4 h-4 rounded-full bg-orange-500 shadow-md"></div>
              <span className="text-gray-700 font-medium">{language === 'en' ? 'High' : 'زیادہ'}</span>
            </div>
            <div className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-md"></div>
                <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-red-500 animate-ping"></div>
              </div>
              <span className="text-gray-700 font-medium">{language === 'en' ? 'Critical' : 'انتہائی'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node details */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-glacier-50 rounded-lg border border-glacier-200">
          <h3 className="font-bold text-lg mb-2">
            {nodeLocations[selectedNode]?.name || selectedNode}
          </h3>
          {nodes.find(n => n.node_id === selectedNode)?.latest_reading && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Temperature:</span>
                <span className="font-semibold ml-2">
                  {Number(nodes.find(n => n.node_id === selectedNode).latest_reading.temperature).toFixed(1)}°C
                </span>
              </div>
              <div>
                <span className="text-gray-600">Seismic:</span>
                <span className="font-semibold ml-2">
                  {Number(nodes.find(n => n.node_id === selectedNode).latest_reading.seismic_activity).toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Water Level:</span>
                <span className="font-semibold ml-2">
                  {Number(nodes.find(n => n.node_id === selectedNode).latest_reading.water_level).toFixed(1)} cm
                </span>
              </div>
              <div>
                <span className="text-gray-600">Battery:</span>
                <span className="font-semibold ml-2">
                  {nodes.find(n => n.node_id === selectedNode).latest_reading.battery}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
