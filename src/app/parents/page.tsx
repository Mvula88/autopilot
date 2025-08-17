'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { 
  User,
  Mail,
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  AlertCircle,
  ThumbsUp,
  Info,
  LogOut,
  GraduationCap
} from 'lucide-react'
import { format } from 'date-fns'

interface ParentData {
  id: string
  email: string
  full_name: string
  children: Array<{
    student: {
      id: string
      first_name: string
      last_name: string
      class: {
        name: string
        grade_level: string
        teacher: {
          full_name: string
        }
      }
      current_grades: any
      attendance_rate: number
    }
  }>
}

interface Communication {
  id: string
  type: string
  subject: string
  content_html: string
  sent_at: string
  student: {
    first_name: string
    last_name: string
  }
}

interface QuickNote {
  id: string
  type: 'positive' | 'concern' | 'info'
  category: string
  message: string
  created_at: string
  student: {
    first_name: string
    last_name: string
  }
}

export default function ParentPortalPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [parentData, setParentData] = useState<ParentData | null>(null)
  const [communications, setCommunications] = useState<Communication[]>([])
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('')

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    const savedEmail = localStorage.getItem('parent_email')
    const savedAccessCode = localStorage.getItem('parent_access_code')
    
    if (savedEmail && savedAccessCode) {
      await authenticateParent(savedEmail, savedAccessCode)
    } else {
      setIsLoading(false)
    }
  }

  const authenticateParent = async (email: string, code: string) => {
    try {
      const supabase = createClient()
      
      // In a real app, you'd verify the access code
      // For now, we'll just check if the parent exists
      const { data: parent } = await supabase
        .from('parents')
        .select(`
          *,
          children:student_parents(
            student:students(
              *,
              class:classes(
                name,
                grade_level,
                teacher:teachers(full_name)
              )
            )
          )
        `)
        .eq('email', email)
        .single()

      if (parent) {
        setParentData(parent)
        setIsAuthenticated(true)
        localStorage.setItem('parent_email', email)
        localStorage.setItem('parent_access_code', code)
        
        if (parent.children.length > 0) {
          setSelectedChild(parent.children[0].student.id)
          loadChildData(parent.children[0].student.id)
        }
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      toast({
        title: 'Authentication failed',
        description: 'Please check your email and access code',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !accessCode) {
      toast({
        title: 'Missing information',
        description: 'Please enter both email and access code',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    await authenticateParent(email, accessCode)
  }

  const handleLogout = () => {
    localStorage.removeItem('parent_email')
    localStorage.removeItem('parent_access_code')
    setIsAuthenticated(false)
    setParentData(null)
    setCommunications([])
    setQuickNotes([])
  }

  const loadChildData = async (studentId: string) => {
    try {
      const supabase = createClient()
      
      // Load communications
      const { data: comms } = await supabase
        .from('communications')
        .select(`
          *,
          student:students(first_name, last_name)
        `)
        .eq('student_id', studentId)
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(10)

      if (comms) {
        setCommunications(comms)
      }

      // Load quick notes
      const { data: notes } = await supabase
        .from('quick_notes')
        .select(`
          *,
          student:students(first_name, last_name)
        `)
        .eq('student_id', studentId)
        .eq('sent_to_parents', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (notes) {
        setQuickNotes(notes)
      }
    } catch (error) {
      console.error('Error loading child data:', error)
    }
  }

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4" />
      case 'concern':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getNoteVariant = (type: string) => {
    switch (type) {
      case 'positive':
        return 'default'
      case 'concern':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <GraduationCap className="h-12 w-12 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl">Parent Portal</CardTitle>
            <CardDescription>
              Sign in to view your child's progress and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Enter your access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your teacher will provide you with an access code
              </p>
            </div>
            <Button 
              className="w-full" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedChildData = parentData?.children.find(
    c => c.student.id === selectedChild
  )?.student

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-semibold">Parent Portal</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {parentData?.full_name || parentData?.email}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Selector */}
        {parentData && parentData.children.length > 1 && (
          <div className="mb-6">
            <Label>Select Child</Label>
            <div className="flex gap-2 mt-2">
              {parentData.children.map((child) => (
                <Button
                  key={child.student.id}
                  variant={selectedChild === child.student.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedChild(child.student.id)
                    loadChildData(child.student.id)
                  }}
                >
                  {child.student.first_name} {child.student.last_name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {selectedChildData && (
          <div className="space-y-6">
            {/* Student Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedChildData.first_name} {selectedChildData.last_name}
                </CardTitle>
                <CardDescription>
                  {selectedChildData.class.name} • {selectedChildData.class.grade_level} • 
                  Teacher: {selectedChildData.class.teacher.full_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Class</p>
                      <p className="font-medium">{selectedChildData.class.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Grade</p>
                      <p className="font-medium">
                        {selectedChildData.current_grades?.overall || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance</p>
                      <p className="font-medium">
                        {selectedChildData.attendance_rate 
                          ? `${selectedChildData.attendance_rate}%` 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Different Content */}
            <Tabs defaultValue="notes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="notes">Recent Notes</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Notes from Teacher</CardTitle>
                    <CardDescription>
                      Quick observations and feedback about your child
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {quickNotes.length > 0 ? (
                      <div className="space-y-3">
                        {quickNotes.map((note) => (
                          <div
                            key={note.id}
                            className="flex items-start space-x-3 p-3 rounded-lg border"
                          >
                            <div className="flex-shrink-0 mt-1">
                              {getNoteIcon(note.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={getNoteVariant(note.type) as any}>
                                  {note.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(note.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <p className="text-sm">{note.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No notes available yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communications">
                <Card>
                  <CardHeader>
                    <CardTitle>Communications</CardTitle>
                    <CardDescription>
                      Messages and updates from the teacher
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {communications.length > 0 ? (
                      <div className="space-y-4">
                        {communications.map((comm) => (
                          <div key={comm.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{comm.subject}</h4>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comm.sent_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div 
                              className="text-sm text-muted-foreground prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: comm.content_html }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No communications yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Progress</CardTitle>
                    <CardDescription>
                      Track your child's academic performance over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Progress tracking will be available soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}