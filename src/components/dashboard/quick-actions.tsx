'use client'

import Link from 'next/link'
import { Upload, Send, Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function QuickActions() {
  const actions = [
    {
      title: 'Import Students',
      description: 'Upload CSV from gradebook',
      icon: Upload,
      href: '/classes/import',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Send Weekly Digest',
      description: 'Generate & send updates',
      icon: Send,
      href: '/digest/send',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Quick Note',
      description: 'Send instant update',
      icon: FileText,
      href: '/notes/new',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Create Class',
      description: 'Add a new class',
      icon: Plus,
      href: '/classes/new',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.href}>
              <button className="w-full p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left">
                <div className={`${action.bgColor} rounded-lg p-2 inline-flex mb-3`}>
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              </button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}