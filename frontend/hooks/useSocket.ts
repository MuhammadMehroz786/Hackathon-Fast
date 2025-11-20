import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [sensorUpdates, setSensorUpdates] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    })

    socketInstance.on('connect', () => {
      console.log('✅ Connected to Barfani backend')
      setIsConnected(true)
    })

    socketInstance.on('new_alert', (alert: any) => {
      console.log('🚨 New alert received:', alert)
      setAlerts(prev => [alert, ...prev].slice(0, 50))
      setLastUpdateTime(new Date())

      // Play alert sound for critical alerts
      if (alert.riskLevel === 'CRITICAL') {
        playAlertSound()
      }
    })

    socketInstance.on('sensor_update', (data: any) => {
      setSensorUpdates(prev => [...prev, data].slice(-100))
      setLastUpdateTime(new Date())
    })

    socketInstance.on('system_reset', (data: any) => {
      console.log('🔄 System reset received - clearing all data')
      setAlerts([])
      setSensorUpdates([])
      setLastUpdateTime(null)
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from backend')
      setIsConnected(false)
    })

    socketInstance.on('reconnect', () => {
      console.log('🔄 Reconnected to backend')
      setIsConnected(true)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const clearAlerts = () => {
    setAlerts([])
    console.log('🧹 Alerts cleared')
  }

  return { socket, alerts, sensorUpdates, isConnected, lastUpdateTime, clearAlerts }
}

function playAlertSound() {
  // Create a simple beep sound
  if (typeof window !== 'undefined' && window.AudioContext) {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }
}
