import { createClient } from '@/lib/supabase/server'
import TeacherStats from '@/components/dashboard/teacher-stats'
import ClassCard from '@/components/dashboard/class-card'
import RecentActivity from '@/components/dashboard/recent-activity'
import QuickActions from '@/components/dashboard/quick-actions'
import { Button } from '@/components/ui/button'
import { Plus, Send, Upload, Users } from 'lucide-react'
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {teacherProfile?.full_name || 'Teacher'}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your parent communications
        </p>
      </div>

      <TeacherStats
        totalStudents={totalStudents}
        weeklyDigestsSent={weeklyDigestsSent}
        avgEngagement={avgEngagement}
        timeSaved={5.2}
      />

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Classes</h2>
            <Link href="/classes/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </Link>
          </div>

          {!teacherClasses || teacherClasses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No classes yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Get started by creating your first class and importing students
              </p>
              <Link href="/classes/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Class
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teacherClasses.map((cls) => (
                <ClassCard key={cls.id} classData={cls} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <RecentActivity communications={recentComms || []} />
        </div>
      </div>
    </div>
  )
}