import { AlertTriangle, Bell, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import moment from 'moment'

interface AlertPanelProps {
  alerts: any[]
  language: 'en' | 'ur' | 'bs'
  onClearAlerts: () => void
}

export default function AlertPanel({ alerts, language, onClearAlerts }: AlertPanelProps) {
  const sortedAlerts = [...alerts].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 15) // Show more alerts

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'MEDIUM':
        return <Bell className="w-5 h-5 text-yellow-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  const getRiskBg = (level: string) => {
    switch (level) {
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

  return (
    <div className="glass-effect rounded-2xl shadow-xl p-6 border border-white/20 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          {language === 'en' ? 'Alert Feed' : language === 'ur' ? 'الرٹ فیڈ' : 'خبرداری فیڈا'}
        </h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm font-semibold text-red-700">
              {language === 'en' ? 'Live' : language === 'ur' ? 'براہ راست' : 'زندہ'}
            </span>
          </div>
          {alerts.length > 0 && (
            <button
              onClick={onClearAlerts}
              className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 transition-all duration-300 hover:scale-105"
              title={language === 'en' ? 'Clear all notifications' : language === 'ur' ? 'تمام اطلاعات صاف کریں' : 'سبے خبران صاف بلے'}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs font-semibold">
                {language === 'en' ? 'Clear' : language === 'ur' ? 'صاف کریں' : 'صاف'}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-2" />
            <p>{language === 'en' ? 'No alerts at this time' : language === 'ur' ? 'اس وقت کوئی الرٹ نہیں' : 'ہنا وقتے خبرداری نشے'}</p>
          </div>
        ) : (
          sortedAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${getRiskBg(alert.riskLevel)} transition-all hover:shadow-lg transform hover:scale-102 animate-slide-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start space-x-3">
                {getRiskIcon(alert.riskLevel)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{alert.node_id}</span>
                    <span className="text-xs text-gray-500">
                      {moment(alert.timestamp).fromNow()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {language === 'en' ? alert.alertMessage : alert.alertMessage}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      alert.riskLevel === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                      alert.riskLevel === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                      alert.riskLevel === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {alert.riskLevel}
                    </span>
                    <span className="text-xs text-gray-600">
                      Score: {alert.riskScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
