'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Search, 
  ThumbsUp, 
  AlertCircle, 
  Info, 
  Send,
  Clock,
  Filter,
  User,
  Calendar,
  X
} from 'lucide-react'
import { format } from 'date-fns'

interface QuickNote {
  id: string
  student_id: string
  student?: {
    first_name: string
    last_name: string
    class?: {
      name: string
    }
  }
  type: 'positive' | 'concern' | 'info'
  category: string
  message: string
  sent_to_parents: boolean
  created_at: string
}

interface Student {
  id: string
  first_name: string
  last_name: string
  class_id: string
  class?: {
    name: string
  }
}

const NOTE_CATEGORIES = {
  positive: [
    'Great participation',
    'Excellent work',
    'Helping others',
    'Improvement shown',
    'Leadership',
    'Creative thinking',
    'Problem solving',
    'Good behavior'
  ],
  concern: [
    'Missing homework',
    'Needs support',
    'Behavior issue',
    'Attendance',
    'Struggling with material',
    'Disruptive',
    'Not participating',
    'Late to class'
  ],
  info: [
    'Parent meeting scheduled',
    'Medical note',
    'Early dismissal',
    'Special accommodation',
    'Extra help session',
    'Test reminder',
    'Field trip',
    'Other'
  ]
}

export default function QuickNotesPage() {
  const { toast } = useToast()
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [noteType, setNoteType] = useState<'positive' | 'concern' | 'info'>('positive')
  const [category, setCategory] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [sendToParents, setSendToParents] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedClass, setSelectedClass] = useState<string>('all')

  useEffect(() => {
    loadStudents()
    loadRecentNotes()
  }, [])

  const loadStudents = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(name)
        `)
        .eq('class.teacher_id', user.id)
        .order('last_name')

      if (data) {
        setStudents(data)
      }
    }
  }

  const loadRecentNotes = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('quick_notes')
        .select(`
          *,
          student:students(
            first_name,
            last_name,
            class:classes(name)
          )
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setNotes(data)
      }
    }
  }

  const handleSubmit = async () => {
    if (!selectedStudent || !category || !message) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('quick_notes')
        .insert({
          teacher_id: user.id,
          student_id: selectedStudent,
          type: noteType,
          category,
          message,
          sent_to_parents: sendToParents
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Note added',
        description: sendToParents ? 'Note saved and will be sent to parents' : 'Note saved successfully',
      })

      // Reset form
      setMessage('')
      setCategory('')
      setSendToParents(false)
      
      // Reload notes
      loadRecentNotes()
    } catch (error) {
      console.error('Error adding note:', error)
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchTerm || 
      note.student?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.student?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || note.type === filterType
    
    return matchesSearch && matchesType
  })

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quick Notes</h1>
        <p className="text-muted-foreground">
          Quickly record observations and feedback about students
        </p>
      </div>

      <Tabs defaultValue="add" className="space-y-4">
        <TabsList>
          <TabsTrigger value="add">
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="mr-2 h-4 w-4" />
            Recent Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Quick Note</CardTitle>
              <CardDescription>
                Record a quick observation or feedback about a student
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student">Select Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Choose a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.last_name}, {student.first_name}
                        {student.class && (
                          <span className="text-muted-foreground ml-2">
                            ({student.class.name})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Note Type */}
              <div className="space-y-2">
                <Label>Note Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={noteType === 'positive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setNoteType('positive')
                      setCategory('')
                    }}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Positive
                  </Button>
                  <Button
                    type="button"
                    variant={noteType === 'concern' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setNoteType('concern')
                      setCategory('')
                    }}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Concern
                  </Button>
                  <Button
                    type="button"
                    variant={noteType === 'info' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setNoteType('info')
                      setCategory('')
                    }}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Info
                  </Button>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_CATEGORIES[noteType].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Add details about this observation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Send to Parents */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendToParents"
                  checked={sendToParents}
                  onChange={(e) => setSendToParents(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="sendToParents" className="text-sm font-normal">
                  Include in parent communication
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMessage('')
                    setCategory('')
                    setSendToParents(false)
                  }}
                >
                  Clear
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Notes</CardTitle>
                  <CardDescription>
                    View and manage your recent student notes
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[200px]"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="concern">Concerns</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredNotes.length > 0 ? (
                <div className="space-y-3">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNoteIcon(note.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {note.student?.first_name} {note.student?.last_name}
                          </p>
                          {note.student?.class && (
                            <span className="text-sm text-muted-foreground">
                              {note.student.class.name}
                            </span>
                          )}
                          <Badge variant={getNoteVariant(note.type) as any}>
                            {note.category}
                          </Badge>
                          {note.sent_to_parents && (
                            <Badge variant="outline" className="text-xs">
                              <Send className="mr-1 h-3 w-3" />
                              Sent to parents
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{note.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(note.created_at), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(note.created_at), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' 
                      ? 'No notes found matching your filters' 
                      : 'No notes yet. Add your first note above!'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}