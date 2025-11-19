import { Activity, AlertTriangle, Database, Wifi, TrendingUp } from 'lucide-react'

interface StatsOverviewProps {
  nodes: any[]
  alerts: any[]
}

export default function StatsOverview({ nodes, alerts }: StatsOverviewProps) {
  const activeNodes = nodes.length
  const criticalAlerts = alerts.filter(a => a.riskLevel === 'CRITICAL').length
  const highAlerts = alerts.filter(a => a.riskLevel === 'HIGH').length
  const totalReadings = nodes.reduce((sum, node) => sum + (node.total_readings || 0), 0)

  const stats = [
    {
      label: 'Active Sensors',
      value: activeNodes,
      icon: Wifi,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      trend: '+100%'
    },
    {
      label: 'Critical Alerts',
      value: criticalAlerts,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-pink-500',
      bgGradient: 'from-red-50 to-pink-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-gradient-to-br from-red-500 to-pink-600',
      trend: criticalAlerts > 0 ? '+' + criticalAlerts : '0'
    },
    {
      label: 'High Risk Alerts',
      value: highAlerts,
      icon: Activity,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
      trend: highAlerts > 0 ? '+' + highAlerts : '0'
    },
    {
      label: 'Total Readings',
      value: totalReadings,
      icon: Database,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      trend: '+' + totalReadings
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`glass-effect rounded-2xl p-6 card-hover border-2 ${stat.borderColor} bg-gradient-to-br ${stat.bgGradient} relative overflow-hidden group`}
        >
          {/* Background decoration */}
          <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.iconBg} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-xs font-semibold text-gray-500">
                <TrendingUp className="w-3 h-3" />
                <span>{stat.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
              <p className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
