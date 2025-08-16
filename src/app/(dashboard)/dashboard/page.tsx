import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  CheckSquare, 
  BookOpen, 
  TrendingUp,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get teacher profile
  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get counts
  const [classesResult, assignmentsResult, pendingResult] = await Promise.all([
    supabase.from('classes').select('*', { count: 'exact' }).eq('teacher_id', user.id),
    supabase.from('assignments').select('*', { count: 'exact' }),
    supabase.from('submissions').select('*', { count: 'exact' }).eq('status', 'pending'),
  ])

  return {
    teacher,
    classCount: classesResult.count || 0,
    assignmentCount: assignmentsResult.count || 0,
    pendingCount: pendingResult.count || 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  if (!stats) {
    return <div>Loading...</div>
  }

  const quickActions = [
    {
      title: 'Quick Grade',
      description: 'Grade multiple choice and short answers',
      icon: CheckSquare,
      href: '/assignments/quick-grade',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Essay Assistant',
      description: 'AI-powered essay evaluation',
      icon: BookOpen,
      href: '/assignments/essay-assistant',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'New Class',
      description: 'Create a new class',
      icon: Users,
      href: '/classes/new',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Import Roster',
      description: 'Import students from CSV',
      icon: FileText,
      href: '/classes/import',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Welcome back, {stats.teacher?.full_name || 'Teacher'}!
        </h1>
        <p className="text-amber-700 mt-2 text-lg">
          Here's an overview of your grading activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-900">Total Classes</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-800">{stats.classCount}</div>
            <p className="text-xs text-amber-600 mt-1">Active this semester</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-orange-900">Assignments</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">{stats.assignmentCount}</div>
            <p className="text-xs text-orange-600 mt-1">Created this month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-yellow-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-yellow-900">Pending Grading</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-800">{stats.pendingCount}</div>
            <p className="text-xs text-yellow-600 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-green-900">Time Saved</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">12.5 hrs</div>
            <p className="text-xs text-green-600 mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-amber-800 mb-6">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="bg-white/80 backdrop-blur-sm border-amber-200 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer h-full">
                <CardHeader>
                  <div className={`p-3 w-fit rounded-lg ${action.bgColor} mb-3`}>
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <CardTitle className="text-lg text-amber-900">{action.title}</CardTitle>
                  <CardDescription className="text-sm text-amber-700">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-amber-800 mb-6">Recent Submissions</h2>
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
          <CardContent className="pt-6">
            {stats.pendingCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      You have {stats.pendingCount} submissions waiting to be graded
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Use Quick Grade or Essay Assistant to process them efficiently
                    </p>
                  </div>
                  <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                    <Link href="/assignments">View All</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p>All caught up! No pending submissions.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}