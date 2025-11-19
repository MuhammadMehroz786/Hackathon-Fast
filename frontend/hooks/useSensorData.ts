import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export function useSensorData(socket: any) {
  const [nodes, setNodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null)

  const fetchNodes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sensor/nodes`)
      setNodes(response.data.nodes || [])
      setLastFetchTime(new Date())
      setError(null)
    } catch (err: any) {
      console.error('Error fetching nodes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchNodes()

    // Only listen to socket updates - no redundant polling
    if (socket) {
      socket.on('sensor_update', (data: any) => {
        console.log('📊 Sensor update received:', data.node_id)
        fetchNodes()
      })

      socket.on('new_alert', (alert: any) => {
        console.log('🚨 New alert received:', alert.node_id)
        fetchNodes()
      })
    }

    return () => {
      if (socket) {
        socket.off('sensor_update')
        socket.off('new_alert')
      }
    }
  }, [socket])

  return { nodes, loading, error, refetch: fetchNodes }
}
