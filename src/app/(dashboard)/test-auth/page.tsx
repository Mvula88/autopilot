'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [teacher, setTeacher] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        setError(`Auth error: ${userError.message}`)
        return
      }

      if (!user) {
        setError('No user logged in')
        return
      }

      setUser(user)

      // Check if teacher record exists
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', user.id)
        .single()

      if (teacherError) {
        setError(`Teacher lookup error: ${teacherError.message}`)
        
        // If teacher doesn't exist, try to create one
        if (teacherError.code === 'PGRST116') {
          const { data: newTeacher, error: createError } = await supabase
            .from('teachers')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || 'Teacher',
              school_name: user.user_metadata?.school_name || 'School'
            })
            .select()
            .single()

          if (createError) {
            setError(`Failed to create teacher: ${createError.message}`)
          } else {
            setTeacher(newTeacher)
            setError('')
          }
        }
      } else {
        setTeacher(teacherData)
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`)
    }
  }

  async function createTeacherRecord() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Teacher',
          school_name: user.user_metadata?.school_name || 'School'
        })
        .select()
        .single()

      if (error) {
        setError(`Create teacher error: ${error.message}`)
      } else {
        setTeacher(data)
        setError('Teacher record created successfully!')
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      {error && (
        <Card className="mb-4 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm">{error}</pre>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>User Status</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <p>No user logged in</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Teacher Record</CardTitle>
        </CardHeader>
        <CardContent>
          {teacher ? (
            <div>
              <p><strong>Teacher ID:</strong> {teacher.id}</p>
              <p><strong>Name:</strong> {teacher.full_name}</p>
              <p><strong>School:</strong> {teacher.school_name}</p>
              <p><strong>Created:</strong> {new Date(teacher.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <div>
              <p>No teacher record found</p>
              {user && (
                <Button onClick={createTeacherRecord} className="mt-4">
                  Create Teacher Record
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}