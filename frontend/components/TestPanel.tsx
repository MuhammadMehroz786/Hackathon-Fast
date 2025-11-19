import { useState, useEffect } from 'react'
import { FlaskConical, AlertTriangle, CheckCircle, XCircle, Loader2, History } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface TestPanelProps {
  language: 'en' | 'ur' | 'bs'
  onDataSent?: () => void
}

interface Scenario {
  name: string
  displayName?: string
  date?: string
  location?: string
  description: string
  riskLevel: string
  type: string
}

export default function TestPanel({ language, onDataSent }: TestPanelProps) {
  const [testing, setTesting] = useState(false)
  const [lastTest, setLastTest] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [scenarios, setScenarios] = useState<Scenario[]>([])

  useEffect(() => {
    // Fetch available scenarios
    axios.get(`${API_URL}/api/test/scenarios`)
      .then(response => setScenarios(response.data.scenarios))
      .catch(error => console.error('Failed to load scenarios:', error))
  }, [])

  const runTest = async (scenario: string) => {
    setTesting(true)
    setLastTest(scenario)
    setTestResults(null)

    try {
      const response = await axios.post(`${API_URL}/api/test/scenario`, { scenario })
      setTestResults(response.data)
      console.log('✅ Test completed:', response.data)

      // Trigger ML refresh
      if (onDataSent) {
        onDataSent()
      }
    } catch (error: any) {
      console.error('❌ Test failed:', error)
      setTestResults({ success: false, error: error.message })
    } finally {
      setTesting(false)
    }
  }

  const clearTestResults = async () => {
    setTestResults(null)
    setLastTest(null)

    // Immediately trigger a normal scenario to populate with realistic real-time data
    try {
      console.log('🔄 Refreshing with real-time data...')
      await axios.post(`${API_URL}/api/test/scenario`, { scenario: 'normal' })
      console.log('✅ Real-time data refreshed')
    } catch (error) {
      console.error('Error refreshing real-time data:', error)
    }
  }

  const getScenarioConfig = (scenario: string) => {
    switch (scenario) {
      case 'normal':
        return {
          color: 'from-green-500 to-emerald-600',
          bgColor: 'bg-green-50 hover:bg-green-100',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          label: language === 'en' ? 'Normal' : 'عام',
          description: language === 'en' ? 'Stable conditions' : 'مستحکم حالات'
        }
      case 'medium':
        return {
          color: 'from-yellow-500 to-amber-600',
          bgColor: 'bg-yellow-50 hover:bg-yellow-100',
          borderColor: 'border-yellow-200',
          icon: AlertTriangle,
          label: language === 'en' ? 'Medium' : 'درمیانی',
          description: language === 'en' ? 'Early warning signs' : 'ابتدائی انتباہ'
        }
      case 'high':
        return {
          color: 'from-orange-500 to-amber-600',
          bgColor: 'bg-orange-50 hover:bg-orange-100',
          borderColor: 'border-orange-200',
          icon: AlertTriangle,
          label: language === 'en' ? 'High' : 'زیادہ',
          description: language === 'en' ? 'Significant changes' : 'اہم تبدیلیاں'
        }
      case 'warning':
      case 'critical':
        return {
          color: 'from-red-500 to-rose-600',
          bgColor: 'bg-red-50 hover:bg-red-100',
          borderColor: 'border-red-200',
          icon: XCircle,
          label: language === 'en' ? 'Critical' : 'انتہائی',
          description: language === 'en' ? 'Dangerous conditions' : 'خطرناک حالات'
        }
      // Historical scenarios
      case 'hunza_2020':
      case 'shishper_2022':
        return {
          color: 'from-red-600 to-rose-700',
          bgColor: 'bg-red-50 hover:bg-red-100',
          borderColor: 'border-red-300',
          icon: History,
          label: scenario,
          description: ''
        }
      case 'passu_2018':
        return {
          color: 'from-orange-600 to-amber-700',
          bgColor: 'bg-orange-50 hover:bg-orange-100',
          borderColor: 'border-orange-300',
          icon: History,
          label: scenario,
          description: ''
        }
      case 'batura_2019':
        return {
          color: 'from-yellow-600 to-amber-700',
          bgColor: 'bg-yellow-50 hover:bg-yellow-100',
          borderColor: 'border-yellow-300',
          icon: History,
          label: scenario,
          description: ''
        }
      default:
        return {
          color: 'from-blue-500 to-cyan-600',
          bgColor: 'bg-blue-50 hover:bg-blue-100',
          borderColor: 'border-blue-200',
          icon: FlaskConical,
          label: scenario,
          description: ''
        }
    }
  }

  return (
    <div className="glass-effect rounded-2xl shadow-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {language === 'en' ? 'Test Mode' : 'ٹیسٹ موڈ'}
            </h2>
            <p className="text-sm text-gray-600">
              {language === 'en' ? 'Simulate different scenarios' : 'مختلف منظرناموں کی نقل کریں'}
            </p>
          </div>
        </div>
        {testing && (
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm font-semibold text-blue-700">
              {language === 'en' ? 'Testing...' : 'جانچ رہے ہیں...'}
            </span>
          </div>
        )}
        {!testing && testResults && (
          <button
            onClick={clearTestResults}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg border-2 border-green-400 shadow-lg transition-all duration-300 hover:scale-105"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {language === 'en' ? 'Back to Real-Time' : 'حقیقی وقت پر واپس'}
            </span>
          </button>
        )}
      </div>

      {/* Baseline Test Scenarios */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          {language === 'en' ? 'Baseline Test Scenarios' : 'بیس لائن ٹیسٹ منظرنامے'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {scenarios.filter(s => s.type === 'baseline').map((scenario) => {
            const config = getScenarioConfig(scenario.name)
            const Icon = config.icon

            return (
              <button
                key={scenario.name}
                onClick={() => runTest(scenario.name)}
                disabled={testing}
                className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4 text-left transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`bg-gradient-to-br ${config.color} p-2 rounded-lg shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">{config.label}</h3>
                    <p className="text-xs text-gray-600">{scenario.description}</p>
                    {lastTest === scenario.name && !testing && testResults?.success && (
                      <div className="mt-2 flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-semibold">
                          {language === 'en' ? 'Last tested' : 'آخری ٹیسٹ'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Historical GLOF Events */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <History className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold text-gray-800">
            {language === 'en' ? 'Historical GLOF Events' : 'تاریخی GLOF واقعات'}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.filter(s => s.type === 'historical').map((scenario) => {
            const config = getScenarioConfig(scenario.name)
            const Icon = config.icon

            return (
              <button
                key={scenario.name}
                onClick={() => runTest(scenario.name)}
                disabled={testing}
                className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4 text-left transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`bg-gradient-to-br ${config.color} p-2 rounded-lg shadow-md flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-base truncate">{scenario.displayName || scenario.name}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ml-2 ${
                        scenario.riskLevel === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                        scenario.riskLevel === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                        scenario.riskLevel === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {scenario.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{scenario.date} • {scenario.location}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{scenario.description}</p>
                    {lastTest === scenario.name && !testing && testResults?.success && (
                      <div className="mt-2 flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-semibold">
                          {language === 'en' ? 'Last tested' : 'آخری ٹیسٹ'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {testResults && (
        <div className={`p-5 rounded-xl border-2 ${
          testResults.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {testResults.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2">
                {testResults.success
                  ? (language === 'en' ? 'Test Completed' : 'ٹیسٹ مکمل')
                  : (language === 'en' ? 'Test Failed' : 'ٹیسٹ ناکام')}
              </h4>
              {testResults.success ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Scenario:</span> {testResults.scenario.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-700">
                    {testResults.message}
                  </p>
                  {testResults.results && (
                    <div className="mt-3 space-y-2">
                      {testResults.results.map((result: any, index: number) => (
                        <div key={index} className="bg-white bg-opacity-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{result.node_id}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              result.alert?.riskLevel === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                              result.alert?.riskLevel === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                              result.alert?.riskLevel === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-green-200 text-green-800'
                            }`}>
                              {result.alert?.riskLevel || 'N/A'}
                            </span>
                          </div>
                          {result.data && (
                            <div className="mt-2 text-xs text-gray-600 grid grid-cols-3 gap-2">
                              <div>Temp: {result.data.temperature}°C</div>
                              <div>Seismic: {result.data.seismic_activity}</div>
                              <div>Water: {result.data.water_level}cm</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-700">{testResults.error}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
