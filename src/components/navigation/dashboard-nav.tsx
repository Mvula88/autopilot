'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  GraduationCap, 
  Home, 
  Users, 
  Send, 
  Settings, 
  LogOut,
  Plus,
  FileText,
  Bell,
  Mail,
  StickyNote
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Classes', href: '/classes', icon: Users },
  { name: 'Quick Notes', href: '/notes', icon: StickyNote },
  { name: 'Weekly Digest', href: '/digest', icon: Mail },
  { name: 'Communications', href: '/communications', icon: Send },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link href="/dashboard" className="flex ml-2 md:mr-24">
              <GraduationCap className="h-8 w-8 text-indigo-600 mr-3" />
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">
                Parent Comm Autopilot
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center ml-10 space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${isActive 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center ml-6 space-x-3">
              <Button
                size="sm"
                className="hidden sm:flex"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Class
              </Button>

              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white">
                    T
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    View Reports
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}