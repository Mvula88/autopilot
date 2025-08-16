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
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Essay Assistant',
      description: 'AI-powered essay evaluation',
      icon: BookOpen,
      href: '/assignments/essay-assistant',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'New Class',
      description: 'Create a new class',
      icon: Users,
      href: '/classes/new',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Import Roster',
      description: 'Import students from CSV',
      icon: FileText,
      href: '/classes/import',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {stats.teacher?.full_name || 'Teacher'}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your grading activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classCount}</div>
            <p className="text-xs text-muted-foreground">Active this semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignmentCount}</div>
            <p className="text-xs text-muted-foreground">Created this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5 hrs</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className={`p-2 w-fit rounded-lg ${action.bgColor} mb-2`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="text-sm">
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
        <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
        <Card>
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
                  <Button asChild size="sm">
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