'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, Send, Eye, Settings, Mail, Users, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface DigestSettings {
  digest_day: string
  digest_time: string
  timezone: string
}

interface DigestPreview {
  student_name: string
  parent_email: string
  highlights: string[]
  grades: any[]
  notes: any[]
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

const TIMES = [
  { value: '08:00', label: '8:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
]

export default function DigestPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<DigestSettings>({
    digest_day: 'friday',
    digest_time: '15:00',
    timezone: 'America/New_York'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previews, setPreviews] = useState<DigestPreview[]>([])
  const [stats, setStats] = useState({
    total_students: 0,
    active_parents: 0,
    pending_digests: 0,
    sent_this_week: 0
  })

  useEffect(() => {
    loadSettings()
    loadStats()
  }, [])

  const loadSettings = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('teachers')
        .select('digest_day, digest_time, timezone')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setSettings(data)
      }
    }
  }

  const loadStats = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Get classes for this teacher
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user.id)
      
      const classIds = classes?.map(c => c.id) || []
      
      // Get student count
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .in('class_id', classIds)

      // Get parent count
      const { count: parentCount } = await supabase
        .from('student_parents')
        .select('*', { count: 'exact', head: true })
        .eq('receive_updates', true)

      // Get sent digests this week
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)
      
      const { count: sentCount } = await supabase
        .from('communications')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id)
        .eq('type', 'weekly_digest')
        .eq('status', 'sent')
        .gte('sent_at', weekStart.toISOString())

      setStats({
        total_students: studentCount || 0,
        active_parents: parentCount || 0,
        pending_digests: 0,
        sent_this_week: sentCount || 0
      })
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('teachers')
        .update({
          digest_day: settings.digest_day,
          digest_time: settings.digest_time,
          timezone: settings.timezone
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Digest settings saved successfully',
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const generatePreview = async () => {
    setIsGenerating(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      // Get classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user.id)

      if (!classes || classes.length === 0) {
        toast({
          title: 'No classes found',
          description: 'Create a class first to generate digests',
          variant: 'destructive',
        })
        return
      }

      // Get students with parents
      const { data: students } = await supabase
        .from('students')
        .select(`
          *,
          student_parents!inner(
            parent_id,
            parents(email, full_name)
          )
        `)
        .in('class_id', classes.map(c => c.id))
        .limit(3) // Preview first 3 students

      if (!students || students.length === 0) {
        toast({
          title: 'No students found',
          description: 'Add students to your classes first',
          variant: 'destructive',
        })
        return
      }

      // Get recent notes for these students
      const studentIds = students.map(s => s.id)
      const { data: notes } = await supabase
        .from('quick_notes')
        .select('*')
        .in('student_id', studentIds)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      // Create preview data
      const previewData = students.map(student => {
        const studentNotes = notes?.filter(n => n.student_id === student.id) || []
        const parent = student.student_parents?.[0]?.parents
        
        return {
          student_name: `${student.first_name} ${student.last_name}`,
          parent_email: parent?.email || 'No parent email',
          highlights: [
            studentNotes.filter(n => n.type === 'positive').length > 0 
              ? `${studentNotes.filter(n => n.type === 'positive').length} positive notes`
              : null,
            studentNotes.filter(n => n.type === 'concern').length > 0
              ? `${studentNotes.filter(n => n.type === 'concern').length} areas of concern`
              : null,
            student.attendance_rate 
              ? `${student.attendance_rate}% attendance`
              : null
          ].filter(Boolean) as string[],
          grades: student.current_grades || {},
          notes: studentNotes.slice(0, 3)
        }
      })

      setPreviews(previewData)
      toast({
        title: 'Preview generated',
        description: `Showing preview for ${previewData.length} students`,
      })
    } catch (error) {
      console.error('Error generating preview:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate preview',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const sendDigests = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      // Here you would implement the actual email sending logic
      // This could involve calling an API endpoint that handles email sending
      
      toast({
        title: 'Digests queued',
        description: 'Weekly digests will be sent according to your schedule',
      })
    } catch (error) {
      console.error('Error sending digests:', error)
      toast({
        title: 'Error',
        description: 'Failed to queue digests',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly Digest</h1>
        <p className="text-muted-foreground">
          Automated weekly updates for parents about their children's progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Parents</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_parents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_digests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent This Week</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent_this_week}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileText className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Digest Schedule</CardTitle>
              <CardDescription>
                Configure when weekly digests are sent to parents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="day">Day of Week</Label>
                  <Select
                    value={settings.digest_day}
                    onValueChange={(value) => setSettings({ ...settings, digest_day: value })}
                  >
                    <SelectTrigger id="day">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select
                    value={settings.digest_time}
                    onValueChange={(value) => setSettings({ ...settings, digest_time: value })}
                  >
                    <SelectTrigger id="time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMES.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Next digest: {settings.digest_day} at{' '}
                  {TIMES.find(t => t.value === settings.digest_time)?.label}
                </span>
              </div>

              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Digest Preview</CardTitle>
                  <CardDescription>
                    See how the weekly digest will look for parents
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={generatePreview}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Preview'}
                  </Button>
                  <Button onClick={sendDigests}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Now
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {previews.length > 0 ? (
                <div className="space-y-6">
                  {previews.map((preview, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{preview.student_name}</p>
                          <p className="text-sm text-muted-foreground">{preview.parent_email}</p>
                        </div>
                        <Badge variant="outline">Preview</Badge>
                      </div>
                      
                      {preview.highlights.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">This Week's Highlights:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {preview.highlights.map((highlight, i) => (
                              <li key={i}>• {highlight}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {preview.notes.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Recent Notes:</p>
                          <div className="space-y-2">
                            {preview.notes.map((note, i) => (
                              <div key={i} className="text-sm flex items-start gap-2">
                                <Badge 
                                  variant={note.type === 'positive' ? 'default' : note.type === 'concern' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {note.type}
                                </Badge>
                                <p className="text-muted-foreground">{note.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Click "Generate Preview" to see sample digests
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Digests</CardTitle>
              <CardDescription>
                History of weekly digests sent to parents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No digests sent yet. They will appear here once you start sending weekly updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}