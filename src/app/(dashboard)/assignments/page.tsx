import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  FileText,
  CheckSquare,
  BookOpen,
  Clock,
  Users,
  MoreVertical,
  Calendar,
  BarChart
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getAssignments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      *,
      classes!inner(
        id,
        name,
        teacher_id
      ),
      submissions(
        id,
        status
      )
    `)
    .eq('classes.teacher_id', user.id)
    .order('created_at', { ascending: false })

  return assignments || []
}

export default async function AssignmentsPage() {
  const assignments = await getAssignments()

  const activeAssignments = assignments.filter(a => 
    !a.due_date || new Date(a.due_date) >= new Date()
  )
  const pastAssignments = assignments.filter(a => 
    a.due_date && new Date(a.due_date) < new Date()
  )

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'multiple_choice':
        return <CheckSquare className="h-4 w-4" />
      case 'short_answer':
        return <FileText className="h-4 w-4" />
      case 'essay':
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'multiple_choice':
        return 'default'
      case 'short_answer':
        return 'secondary'
      case 'essay':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getSubmissionStats = (submissions: any[]) => {
    const total = submissions?.length || 0
    const graded = submissions?.filter(s => s.status === 'finalized').length || 0
    const pending = submissions?.filter(s => s.status === 'pending').length || 0
    
    return { total, graded, pending }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Create and manage assignments for your classes</p>
        </div>
        <Button asChild>
          <Link href="/assignments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Link>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/assignments/quick-grade">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Grade</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Multiple Choice</div>
              <p className="text-xs text-muted-foreground">Grade scanned answer sheets</p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/assignments/essay-assistant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Essay Assistant</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AI Grading</div>
              <p className="text-xs text-muted-foreground">Grade essays with rubrics</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/rubrics">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rubrics</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Templates</div>
              <p className="text-xs text-muted-foreground">Manage grading rubrics</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeAssignments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAssignments.length})</TabsTrigger>
          <TabsTrigger value="all">All ({assignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAssignments.length > 0 ? (
            <div className="grid gap-4">
              {activeAssignments.map((assignment) => {
                const stats = getSubmissionStats(assignment.submissions)
                return (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span>{assignment.classes?.name}</span>
                            <Badge variant={getTypeColor(assignment.type)}>
                              {getTypeIcon(assignment.type)}
                              <span className="ml-1">{assignment.type.replace('_', ' ')}</span>
                            </Badge>
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart className="h-4 w-4 text-muted-foreground" />
                          <span>{assignment.total_points} points</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{stats.graded}/{stats.total} graded</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{stats.pending} pending</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button asChild size="sm">
                          <Link href={`/assignments/${assignment.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/assignments/${assignment.id}/grade`}>
                            Grade Submissions
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active assignments</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first assignment to get started
                </p>
                <Button asChild>
                  <Link href="/assignments/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAssignments.length > 0 ? (
            <div className="grid gap-4">
              {pastAssignments.map((assignment) => {
                const stats = getSubmissionStats(assignment.submissions)
                return (
                  <Card key={assignment.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span>{assignment.classes?.name}</span>
                            <Badge variant={getTypeColor(assignment.type)}>
                              {getTypeIcon(assignment.type)}
                              <span className="ml-1">{assignment.type.replace('_', ' ')}</span>
                            </Badge>
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart className="h-4 w-4 text-muted-foreground" />
                          <span>{assignment.total_points} points</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{stats.graded}/{stats.total} graded</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{stats.pending} pending</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button asChild size="sm">
                          <Link href={`/assignments/${assignment.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past assignments</h3>
                <p className="text-muted-foreground text-center">
                  Past assignments will appear here after their due date
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {assignments.length > 0 ? (
            <div className="grid gap-4">
              {assignments.map((assignment) => {
                const stats = getSubmissionStats(assignment.submissions)
                const isPast = assignment.due_date && new Date(assignment.due_date) < new Date()
                
                return (
                  <Card key={assignment.id} className={isPast ? 'opacity-75' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span>{assignment.classes?.name}</span>
                            <Badge variant={getTypeColor(assignment.type)}>
                              {getTypeIcon(assignment.type)}
                              <span className="ml-1">{assignment.type.replace('_', ' ')}</span>
                            </Badge>
                            {isPast && <Badge variant="secondary">Past</Badge>}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart className="h-4 w-4 text-muted-foreground" />
                          <span>{assignment.total_points} points</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{stats.graded}/{stats.total} graded</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{stats.pending} pending</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button asChild size="sm">
                          <Link href={`/assignments/${assignment.id}`}>
                            View Details
                          </Link>
                        </Button>
                        {!isPast && (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/assignments/${assignment.id}/grade`}>
                              Grade Submissions
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first assignment to get started
                </p>
                <Button asChild>
                  <Link href="/assignments/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}