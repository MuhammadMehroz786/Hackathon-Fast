import { Mountain, Globe, Settings } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  language: 'en' | 'ur' | 'bs'
  setLanguage: (lang: 'en' | 'ur' | 'bs') => void
  isConnected?: boolean
  lastUpdateTime?: Date | null
}

export default function Header({ language, setLanguage, isConnected = true, lastUpdateTime }: HeaderProps) {
  return (
    <header className="glass-effect sticky top-0 z-50 mb-6">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Mountain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {language === 'en' ? 'Project Barfani' : language === 'ur' ? 'پروجیکٹ برفانی' : 'Barfani Project'}
              </h1>
              <p className="text-gray-600 text-sm font-medium">
                {language === 'en'
                  ? 'Glacier Monitoring & GLOF Early Warning System'
                  : language === 'ur'
                  ? 'گلیشیئر مانیٹرنگ اور سیلاب کی ابتدائی وارننگ'
                  : 'گلیشیر تھاسومے مساپھیرو ہن GLOF خبرداری سسٹم'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/settings"
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Settings className="w-5 h-5" />
              <span className="font-semibold">
                {language === 'en' ? 'Settings' : language === 'ur' ? 'ترتیبات' : 'ترتیباٹ'}
              </span>
            </Link>

            <button
              onClick={() => setLanguage(language === 'en' ? 'ur' : language === 'ur' ? 'bs' : 'en')}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Globe className="w-5 h-5" />
              <span className="font-semibold">
                {language === 'en' ? 'اردو' : language === 'ur' ? 'Burushaski' : 'English'}
              </span>
            </button>

            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${
              isConnected
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected && (
                  <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-semibold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                  {isConnected
                    ? (language === 'en' ? 'Real-Time Active' : language === 'ur' ? 'براہ راست فعال' : 'وقتے فعالی')
                    : (language === 'en' ? 'Disconnected' : language === 'ur' ? 'منقطع' : 'منقطعہ')}
                </span>
                {lastUpdateTime && isConnected && (
                  <span className="text-xs text-gray-500">
                    {new Date(lastUpdateTime).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
