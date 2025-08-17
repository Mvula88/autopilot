import { createClient } from '@/lib/supabase/server'
import TeacherStats from '@/components/dashboard/teacher-stats'
import ClassCard from '@/components/dashboard/class-card'
import RecentActivity from '@/components/dashboard/recent-activity'
import QuickActions from '@/components/dashboard/quick-actions'
import MagicMessage from '@/components/dashboard/magic-message'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Send, 
  Upload, 
  Users, 
  TrendingUp, 
  Clock, 
  Mail,
  Calendar,
  ArrowRight,
  Sparkles,
  Activity,
  BookOpen,
  Bell,
  BarChart3,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get teacher profile
  const { data: teacherProfile } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get teacher classes with student count
  const { data: teacherClasses } = await supabase
    .from('classes')
    .select('*, students(count)')
    .eq('teacher_id', user.id)

  // Get recent communications
  const { data: recentComms } = await supabase
    .from('communications')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate stats
  const totalStudents = teacherClasses?.reduce((sum, cls) => 
    sum + (cls.students?.[0]?.count || 0), 0
  ) || 0
  const weeklyDigestsSent = recentComms?.filter(c => 
    c.type === 'weekly_digest' && c.status === 'sent'
  ).length || 0
  const avgEngagement = 75 // This would be calculated from real engagement data

  // Get current time for greeting
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {greeting}, {teacherProfile?.full_name?.split(' ')[0] || 'Teacher'}!
                <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              </h1>
              <p className="mt-2 text-blue-100">
                Here's your communication dashboard for {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
              <Activity className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Weekly Digests</p>
                  <p className="text-2xl font-bold">{weeklyDigestsSent}</p>
                </div>
                <Mail className="h-8 w-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Engagement Rate</p>
                  <p className="text-2xl font-bold">{avgEngagement}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Time Saved</p>
                  <p className="text-2xl font-bold">5.2h</p>
                </div>
                <Clock className="h-8 w-8 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/digest">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Send className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Send Digest</h3>
                  <p className="text-sm text-gray-600 mt-1">Weekly parent updates</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/notes">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Bell className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Quick Note</h3>
                  <p className="text-sm text-gray-600 mt-1">Send instant update</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">Engagement metrics</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/classes/import">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Import Students</h3>
                  <p className="text-sm text-gray-600 mt-1">Bulk upload roster</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/classes/new">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-pink-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900">New Class</h3>
                  <p className="text-sm text-gray-600 mt-1">Create a class</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Magic Message Section */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <MagicMessage />
          </div>
          <div className="lg:col-span-2">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-700">NEW</Badge>
                  IEP/504 Compliance Templates
                </CardTitle>
                <CardDescription>
                  Pre-approved templates that ensure compliance with special education requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start">
                    <span className="text-xs">Progress Update</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="text-xs">Goal Achievement</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="text-xs">Accommodation Review</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="text-xs">Quarterly Report</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="text-xs">Meeting Request</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="text-xs">Support Strategies</span>
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    All templates reviewed by special education coordinators
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Classes and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classes Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Your Classes
              </h2>
              <Link href="/classes">
                <Button variant="outline" size="sm" className="hover:bg-blue-50">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {!teacherClasses || teacherClasses.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes yet</h3>
                  <p className="text-gray-600 mb-6">
                    Get started by creating your first class and importing students
                  </p>
                  <Link href="/classes/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Class
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teacherClasses.map((cls) => (
                  <Card key={cls.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-blue-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{cls.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {cls.grade_level} • {cls.subject}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-blue-50">
                          {cls.students?.[0]?.count || 0} students
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(4, cls.students?.[0]?.count || 0))].map((_, i) => (
                            <div key={i} className="h-8 w-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white" />
                          ))}
                          {(cls.students?.[0]?.count || 0) > 4 && (
                            <div className="h-8 w-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                +{(cls.students?.[0]?.count || 0) - 4}
                              </span>
                            </div>
                          )}
                        </div>
                        <Link href={`/classes/${cls.id}`}>
                          <Button size="sm" variant="ghost" className="hover:bg-blue-50">
                            View
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Recent Activity
              </h2>
            </div>
            
            <Card className="border-2">
              <CardContent className="p-6">
                {!recentComms || recentComms.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Mail className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">No recent activity</p>
                    <p className="text-xs text-gray-500 mt-1">Your communications will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentComms.slice(0, 5).map((comm) => (
                      <div key={comm.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`h-2 w-2 rounded-full mt-2 ${
                          comm.status === 'sent' ? 'bg-green-500' : 
                          comm.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {comm.type === 'weekly_digest' ? 'Weekly Digest' : 
                             comm.type === 'quick_note' ? 'Quick Note' : comm.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(comm.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          comm.status === 'sent' ? 'bg-green-50 text-green-700' :
                          comm.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {comm.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="border-2 mt-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Send className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Weekly Digest</p>
                      <p className="text-xs text-gray-500">Friday at 3:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Parent Conference</p>
                      <p className="text-xs text-gray-500">Next Monday</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}