import { formatRelativeTime } from '@/lib/utils/formatters'
import { Mail, FileText, AlertCircle } from 'lucide-react'

interface RecentActivityProps {
  communications: any[]
}

export default function RecentActivity({ communications }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'weekly_digest':
        return <Mail className="h-4 w-4" />
      case 'quick_note':
        return <FileText className="h-4 w-4" />
      case 'alert':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weekly_digest':
        return 'bg-blue-100 text-blue-600'
      case 'quick_note':
        return 'bg-green-100 text-green-600'
      case 'alert':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      
      {communications.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500">No recent communications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {communications.map((comm) => (
            <div key={comm.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${getTypeColor(comm.type)}`}>
                {getIcon(comm.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {comm.subject}
                </p>
                <p className="text-sm text-gray-500">
                  To: {comm.parent?.full_name || comm.parent?.email || 'Parent'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(comm.created_at)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${comm.status === 'sent' ? 'bg-green-100 text-green-800' : 
                    comm.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    comm.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                  {comm.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}