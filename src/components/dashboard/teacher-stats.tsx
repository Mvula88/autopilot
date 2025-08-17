import { Users, Send, TrendingUp, Clock } from 'lucide-react'

interface TeacherStatsProps {
  totalStudents: number
  weeklyDigestsSent: number
  avgEngagement: number
  timeSaved: number
}

export default function TeacherStats({
  totalStudents,
  weeklyDigestsSent,
  avgEngagement,
  timeSaved
}: TeacherStatsProps) {
  const stats = [
    {
      name: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Weekly Digests Sent',
      value: weeklyDigestsSent,
      icon: Send,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Avg. Engagement',
      value: `${avgEngagement}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Time Saved This Week',
      value: `${timeSaved} hrs`,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.bgColor} rounded-lg p-3`}>
                <Icon className={`h-6 w-6 text-${stat.color.replace('bg-', '')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}