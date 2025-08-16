import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ArrowLeft,
  Download,
  Edit,
  FileText,
  CheckSquare,
  BookOpen,
  Calendar,
  BarChart,
  Users,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

async function getAssignmentDetails(assignmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: assignment } = await supabase
    .from('assignments')
    .select(`
      *,
      classes!inner(
        id,
        name,
        teacher_id
      ),
      rubrics(*),
      answer_keys(*)
    `)
    .eq('id', assignmentId)
    .eq('classes.teacher_id', user.id)
    .single()

  return assignment
}

async function getSubmissions(assignmentId: string) {
  const supabase = await createClient()
  
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      students(
        id,
        student_id,
        first_name,
        last_name
      )
    `)
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: false })

  return submissions || []
}

export default async function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const assignment = await getAssignmentDetails(params.id)
  
  if (!assignment) {
    notFound()
  }

  const submissions = await getSubmissions(params.id)

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

  const stats = {
    total: submissions.length,
    graded: submissions.filter(s => s.status === 'finalized').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    averageScore: submissions
      .filter(s => s.final_grade !== null)
      .reduce((sum, s) => sum + (s.final_grade || 0), 0) / 
      (submissions.filter(s => s.final_grade !== null).length || 1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/assignments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{assignment.classes?.name}</Badge>
              <Badge variant="outline">
                {getTypeIcon(assignment.type)}
                <span className="ml-1">{assignment.type.replace('_', ' ')}</span>
              </Badge>
              {assignment.due_date && (
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {assignment.type === 'multiple_choice' && !assignment.answer_keys?.length && (
            <Button asChild variant="outline">
              <Link href={`/assignments/${params.id}/answer-key`}>
                <Edit className="mr-2 h-4 w-4" />
                Set Answer Key
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={`/assignments/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Assignment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignment.total_points}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.graded} graded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.graded > 0 ? `${stats.averageScore.toFixed(1)}%` : '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Submissions</CardTitle>
              <CardDescription>Student submissions for this assignment</CardDescription>
            </div>
            <div className="flex gap-2">
              {stats.graded > 0 && (
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/assignments/${params.id}/export-grades`}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Grades
                  </a>
                </Button>
              )}
              <Button asChild size="sm">
                <Link href={`/assignments/${params.id}/grade`}>
                  Start Grading
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.students?.last_name}, {submission.students?.first_name}
                    </TableCell>
                    <TableCell>{submission.students?.student_id || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        submission.status === 'finalized' ? 'default' :
                        submission.status === 'ai_graded' ? 'secondary' :
                        submission.status === 'reviewed' ? 'outline' :
                        'destructive'
                      }>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {submission.final_grade !== null ? submission.final_grade : '-'}
                    </TableCell>
                    <TableCell>
                      {submission.final_grade !== null 
                        ? `${((submission.final_grade / assignment.total_points) * 100).toFixed(1)}%`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {new Date(submission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/assignments/${params.id}/submissions/${submission.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground text-center">
                Students haven't submitted their work for this assignment
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}