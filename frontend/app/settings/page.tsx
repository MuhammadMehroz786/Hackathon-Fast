'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface EmailConfig {
  emailService: string
  emailUser: string
  emailConfigured: boolean
  recipients: {
    pdma: string
    emergency: string
    community: string
  }
  thresholds: {
    temperature: number
    seismic: number
    waterLevel: number
  }
}

export default function Settings() {
  const [language, setLanguage] = useState<'en' | 'ur' | 'bs'>('en')
  const [config, setConfig] = useState<EmailConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  // Form state
  const [emailUser, setEmailUser] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [pdmaEmail, setPdmaEmail] = useState('')
  const [emergencyEmail, setEmergencyEmail] = useState('')
  const [communityEmail, setCommunityEmail] = useState('')
  const [tempThreshold, setTempThreshold] = useState(10)
  const [seismicThreshold, setSeismicThreshold] = useState(0.5)
  const [waterLevelThreshold, setWaterLevelThreshold] = useState(20)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings/email`)
      const { config } = response.data
      setConfig(config)

      // Populate form
      setEmailUser(config.emailUser)
      setPdmaEmail(config.recipients.pdma)
      setEmergencyEmail(config.recipients.emergency)
      setCommunityEmail(config.recipients.community)
      setTempThreshold(config.thresholds.temperature)
      setSeismicThreshold(config.thresholds.seismic)
      setWaterLevelThreshold(config.thresholds.waterLevel)
      setTestEmail(config.emailUser)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setLoading(false)
    }
  }

  const saveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await axios.post(`${API_URL}/api/settings/email`, {
        emailService: 'gmail',
        emailUser,
        emailPassword: emailPassword || undefined, // Only send if changed
        pdmaEmail,
        emergencyEmail,
        communityEmail
      })

      setMessage(language === 'en'
        ? '✅ Email settings saved! Server will restart automatically.'
        : language === 'ur'
        ? 'ای میل کی ترتیبات محفوظ ہو گئیں! سرور خود کار طریقے سے دوبارہ شروع ہو جائے گا۔'
        : '✅ Email settings save! Server restart automatic.')

      // Reload settings
      setTimeout(() => {
        fetchSettings()
        setEmailPassword('') // Clear password field
      }, 1500)
    } catch (error) {
      setMessage(language === 'en'
        ? '❌ Failed to save settings'
        : language === 'ur'
        ? 'ترتیبات محفوظ کرنے میں ناکام'
        : '❌ Settings save nay hui')
    } finally {
      setSaving(false)
    }
  }

  const saveThresholds = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await axios.post(`${API_URL}/api/settings/thresholds`, {
        temperature: tempThreshold,
        seismic: seismicThreshold,
        waterLevel: waterLevelThreshold
      })

      setMessage(language === 'en'
        ? '✅ Alert thresholds updated!'
        : language === 'ur'
        ? 'الرٹ کی حدیں اپ ڈیٹ ہو گئیں!'
        : '✅ Alert thresholds update!')
    } catch (error) {
      setMessage(language === 'en'
        ? '❌ Failed to update thresholds'
        : language === 'ur'
        ? 'حدیں اپ ڈیٹ کرنے میں ناکام'
        : '❌ Thresholds update nay hui')
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) return

    setSendingTest(true)
    setMessage('')

    try {
      const response = await axios.post(`${API_URL}/api/settings/test-email`, {
        recipient: testEmail
      })

      if (response.data.demo) {
        setMessage(language === 'en'
          ? '📧 Test email logged to console (Demo Mode)'
          : language === 'ur'
          ? 'ٹیسٹ ای میل کنسول میں لاگ ہو گئی (ڈیمو موڈ)'
          : '📧 Test email console log (Demo Mode)')
      } else {
        setMessage(language === 'en'
          ? `✅ Test email sent to ${testEmail}!`
          : language === 'ur'
          ? `ٹیسٹ ای میل ${testEmail} کو بھیج دی گئی!`
          : `✅ Test email ${testEmail} send!`)
      }
    } catch (error: any) {
      setMessage(language === 'en'
        ? `❌ Failed: ${error.response?.data?.error || error.message}`
        : language === 'ur'
        ? `ناکام: ${error.response?.data?.error || error.message}`
        : `❌ Failed: ${error.response?.data?.error || error.message}`)
    } finally {
      setSendingTest(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading settings...</p>
        </div>
      </div>
    )
  }

  const text = {
    en: {
      title: 'System Settings',
      emailConfig: 'Email Configuration',
      emailUser: 'Gmail Address',
      emailPassword: 'Gmail App Password',
      passwordHint: 'Leave blank to keep current password',
      recipients: 'Alert Recipients',
      pdma: 'PDMA Email',
      emergency: 'Emergency Response Email',
      community: 'Community Leaders Email',
      thresholds: 'Alert Thresholds',
      temperature: 'Temperature Threshold (°C)',
      seismic: 'Seismic Activity Threshold',
      waterLevel: 'Water Level Increase (%)',
      testEmail: 'Test Email',
      testEmailPlaceholder: 'Enter email to test',
      sendTest: 'Send Test Email',
      save: 'Save Settings',
      backToDashboard: 'Back to Dashboard',
      status: 'Email Status',
      configured: 'Configured ✅',
      notConfigured: 'Not Configured ⚠️'
    },
    ur: {
      title: 'سسٹم کی ترتیبات',
      emailConfig: 'ای میل کی ترتیب',
      emailUser: 'جی میل ایڈریس',
      emailPassword: 'جی میل ایپ پاس ورڈ',
      passwordHint: 'موجودہ پاس ورڈ رکھنے کے لیے خالی چھوڑ دیں',
      recipients: 'الرٹ وصول کنندگان',
      pdma: 'پی ڈی ایم اے ای میل',
      emergency: 'ایمرجنسی رسپانس ای میل',
      community: 'کمیونٹی لیڈرز ای میل',
      thresholds: 'الرٹ کی حدیں',
      temperature: 'درجہ حرارت کی حد (°C)',
      seismic: 'زلزلہ کی سرگرمی کی حد',
      waterLevel: 'پانی کی سطح میں اضافہ (%)',
      testEmail: 'ٹیسٹ ای میل',
      testEmailPlaceholder: 'ٹیسٹ کے لیے ای میل درج کریں',
      sendTest: 'ٹیسٹ ای میل بھیجیں',
      save: 'ترتیبات محفوظ کریں',
      backToDashboard: 'ڈیش بورڈ پر واپس جائیں',
      status: 'ای میل کی حالت',
      configured: 'ترتیب شدہ ✅',
      notConfigured: 'ترتیب نہیں ہے ⚠️'
    },
    bs: {
      title: 'System Settings',
      emailConfig: 'Email Setti',
      emailUser: 'Gmail Address',
      emailPassword: 'Gmail App Password',
      passwordHint: 'Blank chus password changay nay',
      recipients: 'Alert Recipients',
      pdma: 'PDMA Email',
      emergency: 'Emergency Email',
      community: 'Community Email',
      thresholds: 'Alert Thresholds',
      temperature: 'Tápman Threshold (°C)',
      seismic: 'Seismic Threshold',
      waterLevel: 'Hik Level (%)',
      testEmail: 'Test Email',
      testEmailPlaceholder: 'Email enter',
      sendTest: 'Test Email Send',
      save: 'Save Settings',
      backToDashboard: 'Dashboard Return',
      status: 'Email Status',
      configured: 'Configured ✅',
      notConfigured: 'Not Configured ⚠️'
    }
  }

  const t = text[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">{t.title}</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
              ← {t.backToDashboard}
            </Link>
          </div>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ur' : language === 'ur' ? 'bs' : 'en')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {language === 'en' ? 'اردو' : language === 'ur' ? 'Burushaski' : 'English'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-6xl mx-auto mb-4">
          <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.status}</h2>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full ${config?.emailConfigured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {config?.emailConfigured ? t.configured : t.notConfigured}
            </div>
            {config?.emailConfigured && (
              <p className="text-gray-600">
                Using: <strong>{config.emailUser}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Email Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.emailConfig}</h2>
          <form onSubmit={saveEmailSettings}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">{t.emailUser}</label>
                <input
                  type="email"
                  value={emailUser}
                  onChange={(e) => setEmailUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="your-email@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">{t.emailPassword}</label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="abcd efgh ijkl mnop"
                />
                <p className="text-sm text-gray-500 mt-1">{t.passwordHint}</p>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mt-6 mb-3">{t.recipients}</h3>

              <div>
                <label className="block text-gray-700 font-medium mb-2">{t.pdma}</label>
                <input
                  type="email"
                  value={pdmaEmail}
                  onChange={(e) => setPdmaEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">{t.emergency}</label>
                <input
                  type="email"
                  value={emergencyEmail}
                  onChange={(e) => setEmergencyEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">{t.community}</label>
                <input
                  type="email"
                  value={communityEmail}
                  onChange={(e) => setCommunityEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '...' : t.save}
              </button>
            </div>
          </form>
        </div>

        {/* Thresholds & Test */}
        <div className="space-y-8">
          {/* Alert Thresholds */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.thresholds}</h2>
            <form onSubmit={saveThresholds}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t.temperature}: <strong>{tempThreshold}°C</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={tempThreshold}
                    onChange={(e) => setTempThreshold(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t.seismic}: <strong>{seismicThreshold}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={seismicThreshold}
                    onChange={(e) => setSeismicThreshold(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t.waterLevel}: <strong>{waterLevelThreshold}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={waterLevelThreshold}
                    onChange={(e) => setWaterLevelThreshold(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? '...' : t.save}
                </button>
              </div>
            </form>
          </div>

          {/* Test Email */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.testEmail}</h2>
            <div className="space-y-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t.testEmailPlaceholder}
              />
              <button
                onClick={sendTestEmail}
                disabled={sendingTest || !testEmail}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {sendingTest ? '...' : t.sendTest}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
