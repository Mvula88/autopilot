import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get assignment details with class info
    const { data: assignment } = await supabase
      .from('assignments')
      .select(`
        *,
        classes!inner(
          id,
          name,
          teacher_id
        )
      `)
      .eq('id', id)
      .eq('classes.teacher_id', user.id)
      .single()

    if (!assignment) {
      return new NextResponse('Assignment not found', { status: 404 })
    }

    // Get all submissions with student info
    const { data: submissions } = await supabase
      .from('submissions')
      .select(`
        *,
        students!inner(
          student_id,
          first_name,
          last_name
        )
      `)
      .eq('assignment_id', id)
      .order('students.last_name', { ascending: true })

    if (!submissions || submissions.length === 0) {
      return new NextResponse('No submissions found', { status: 404 })
    }

    // Create CSV content
    const csvRows = [
      ['Student ID', 'Last Name', 'First Name', 'Score', 'Percentage', 'Status', 'Graded Date'],
      ...submissions.map(sub => [
        sub.students.student_id || '',
        sub.students.last_name,
        sub.students.first_name,
        sub.final_grade?.toString() || '0',
        ((sub.final_grade / assignment.total_points) * 100).toFixed(1) + '%',
        sub.status,
        sub.graded_at ? new Date(sub.graded_at).toLocaleDateString() : ''
      ])
    ]

    const csvContent = csvRows.map(row => row.join(',')).join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${assignment.title.replace(/[^a-z0-9]/gi, '_')}_grades.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting grades:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}