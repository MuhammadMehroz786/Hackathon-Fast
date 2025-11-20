'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import Map from '@/components/Map'
import AlertPanel from '@/components/AlertPanel'
import StatsOverview from '@/components/StatsOverview'
import TestPanel from '@/components/TestPanel'
import MLInsights from '@/components/MLInsights'
import ManualControl from '@/components/ManualControl'
import { useSocket } from '@/hooks/useSocket'
import { useSensorData } from '@/hooks/useSensorData'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'ur' | 'bs'>('en')
  const [testModeEnabled, setTestModeEnabled] = useState(false)
  const [mlRefreshTrigger, setMlRefreshTrigger] = useState(0)
  const { socket, alerts, sensorUpdates, isConnected, lastUpdateTime, clearAlerts } = useSocket()
  const { nodes, loading } = useSensorData(socket)

  const triggerMLRefresh = () => {
    setMlRefreshTrigger(prev => prev + 1)
  }

  // Handle test mode toggle - reset system when disabling test mode
  const handleTestModeToggle = async () => {
    const newMode = !testModeEnabled

    // If turning OFF test mode (going to real-time mode), reset everything
    if (!newMode && testModeEnabled) {
      try {
        console.log('🔄 Switching to Real-Time Mode - Resetting system...')
        const response = await axios.post(`${API_URL}/api/sensor/reset`)
        console.log('✅ System reset:', response.data.message)

        // Clear local alerts as well
        clearAlerts()

        // Trigger ML refresh after reset
        triggerMLRefresh()
      } catch (error) {
        console.error('❌ Failed to reset system:', error)
      }
    }

    setTestModeEnabled(newMode)
  }

  return (
    <div className="min-h-screen">
      <Header
        language={language}
        setLanguage={setLanguage}
        isConnected={isConnected}
        lastUpdateTime={lastUpdateTime}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Test Mode Toggle */}
        <div className="animate-slide-in">
          <div className="glass-effect rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`bg-gradient-to-br ${testModeEnabled ? 'from-purple-500 to-pink-600' : 'from-gray-400 to-gray-500'} p-3 rounded-xl shadow-lg transition-all duration-300`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold bg-gradient-to-r ${testModeEnabled ? 'from-purple-600 to-pink-600' : 'from-gray-600 to-gray-500'} bg-clip-text text-transparent transition-all duration-300`}>
                    {language === 'en' ? 'Test Mode' : language === 'ur' ? 'ٹیسٹ موڈ' : 'تجربہٹو ہوسومے'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {language === 'en'
                      ? testModeEnabled
                        ? 'Testing features enabled - Simulate different scenarios'
                        : 'Enable test mode to access testing features'
                      : language === 'ur'
                        ? testModeEnabled
                          ? 'ٹیسٹنگ خصوصیات فعال - مختلف منظرناموں کی نقل کریں'
                          : 'ٹیسٹنگ خصوصیات تک رسائی کے لیے ٹیسٹ موڈ کو فعال کریں'
                        : testModeEnabled
                          ? 'تجربہٹو خصوصیات فعالی - مختلف حالات نقل بلے'
                          : 'تجربہٹو ہوسومے فعالی بلاس خصوصیات رسائی'
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestModeToggle}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  testModeEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                    testModeEnabled ? 'translate-x-12' : 'translate-x-1'
                  }`}
                >
                  {testModeEnabled ? (
                    <svg className="w-10 h-10 text-purple-600 p-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-gray-400 p-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </button>
            </div>

            {testModeEnabled && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 animate-slide-in">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold text-purple-700">
                    {language === 'en'
                      ? 'Test Mode Active - Use scenario buttons or manual controls below'
                      : language === 'ur'
                        ? 'ٹیسٹ موڈ فعال - نیچے دیے گئے منظرنامہ بٹن یا دستی کنٹرول استعمال کریں'
                        : 'تجربہٹو ہوسومے فعالی - حالات بٹناص یا دستین کنٹرول نیچے استعمال بلے'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Mode Panel - Only show when enabled */}
        {testModeEnabled && (
          <>
            <div className="animate-slide-in">
              <TestPanel language={language} onDataSent={triggerMLRefresh} />
            </div>

            {/* Manual Control Panel */}
            <div className="animate-slide-in" style={{ animationDelay: '0.03s' }}>
              <ManualControl language={language} onDataSent={triggerMLRefresh} />
            </div>
          </>
        )}

        {/* Stats Overview */}
        <div className="animate-slide-in" style={{ animationDelay: '0.05s' }}>
          <StatsOverview nodes={nodes} alerts={alerts} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Map - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Map nodes={nodes} alerts={alerts} language={language} />
          </div>

          {/* Alert Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <AlertPanel alerts={alerts} language={language} onClearAlerts={clearAlerts} />
          </div>
        </div>

        {/* Detailed Dashboard */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Dashboard nodes={nodes} sensorUpdates={sensorUpdates} language={language} />
        </div>

        {/* ML Insights */}
        <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <MLInsights language={language} refreshTrigger={mlRefreshTrigger} />
        </div>
      </main>
    </div>
  )
}
