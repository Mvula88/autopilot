import { createClient } from './server'

export async function getTeacherProfile(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export async function getTeacherClasses(teacherId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      students(count)
    `)
    .eq('teacher_id', teacherId)
    .eq('active', true)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function getClassWithStudents(classId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      students(*)
    `)
    .eq('id', classId)
    .single()
  
  return { data, error }
}

export async function getStudentWithParents(studentId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      student_parents(
        *,
        parent:parents(*)
      )
    `)
    .eq('id', studentId)
    .single()
  
  return { data, error }
}

export async function getRecentCommunications(teacherId: string, limit = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('communications')
    .select(`
      *,
      student:students(*),
      parent:parents(*)
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export async function getQuickNotes(studentId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('quick_notes')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}