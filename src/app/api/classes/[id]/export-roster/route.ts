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

    // Verify the class belongs to the user
    const { data: classData } = await supabase
      .from('classes')
      .select('name')
      .eq('id', id)
      .eq('teacher_id', user.id)
      .single()

    if (!classData) {
      return new NextResponse('Class not found', { status: 404 })
    }

    // Get all students in the class
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', id)
      .order('last_name', { ascending: true })

    if (!students || students.length === 0) {
      return new NextResponse('No students found', { status: 404 })
    }

    // Create CSV content
    const csvRows = [
      ['student_id', 'first_name', 'last_name', 'email'],
      ...students.map(student => [
        student.student_id || '',
        student.first_name,
        student.last_name,
        student.email || ''
      ])
    ]

    const csvContent = csvRows.map(row => row.join(',')).join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${classData.name.replace(/[^a-z0-9]/gi, '_')}_roster.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting roster:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}