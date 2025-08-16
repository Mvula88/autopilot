'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Bot, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  Save,
  Edit
} from 'lucide-react'
import Link from 'next/link'

interface GradingResult {
  studentId: string
  studentName: string
  essayText: string
  aiScore: number
  aiConfidence: number
  feedback: {
    category: string
    score: number
    maxScore: number
    comments: string
  }[]
  suggestedGrade: number
  finalGrade?: number
}

export default function EssayAssistantPage() {
  const { toast } = useToast()
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [assignments, setAssignments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedRubric, setSelectedRubric] = useState<any>(null)
  const [isGrading, setIsGrading] = useState(false)
  const [gradingResults, setGradingResults] = useState<GradingResult[]>([])
  const [currentStudent, setCurrentStudent] = useState(0)
  const [essayText, setEssayText] = useState('')

  useEffect(() => {
    async function fetchAssignments() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data } = await supabase
        .from('assignments')
        .select(`
          *,
          classes!inner(
            id,
            name,
            teacher_id
          ),
          rubrics(*)
        `)
        .eq('classes.teacher_id', user.id)
        .eq('type', 'essay')
        .order('created_at', { ascending: false })

      setAssignments(data || [])
    }

    fetchAssignments()
  }, [])

  useEffect(() => {
    if (selectedAssignment) {
      loadAssignmentData()
    }
  }, [selectedAssignment])

  async function loadAssignmentData() {
    const supabase = createClient()
    
    const assignment = assignments.find(a => a.id === selectedAssignment)
    if (!assignment) return

    if (assignment.rubrics) {
      setSelectedRubric(assignment.rubrics)
    }

    // Get students in the class
    const { data: studentsData } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', assignment.class_id)
      .order('last_name')

    setStudents(studentsData || [])
  }

  const simulateAIGrading = (text: string, rubric: any) => {
    // Simulate AI grading with mock data
    const categories = rubric?.criteria || [
      { name: 'Thesis Statement', weight: 20 },
      { name: 'Evidence & Support', weight: 30 },
      { name: 'Organization', weight: 20 },
      { name: 'Grammar & Style', weight: 20 },
      { name: 'Conclusion', weight: 10 },
    ]

    const feedback = categories.map((cat: any) => {
      const score = Math.floor(Math.random() * 20) + 80 // Random score 80-100%
      return {
        category: cat.name,
        score: (score * cat.weight) / 100,
        maxScore: cat.weight,
        comments: generateFeedback(cat.name, score),
      }
    })

    const totalScore = feedback.reduce((sum: number, f: any) => sum + f.score, 0)
    const confidence = Math.floor(Math.random() * 15) + 85 // 85-100% confidence

    return {
      aiScore: totalScore,
      aiConfidence: confidence,
      feedback,
      suggestedGrade: totalScore,
    }
  }

  const generateFeedback = (category: string, score: number) => {
    const feedbackMap: { [key: string]: { [key: string]: string } } = {
      'Thesis Statement': {
        high: 'Strong, clear thesis that effectively states the main argument.',
        medium: 'Thesis present but could be more specific or compelling.',
        low: 'Thesis needs clarification or stronger positioning.',
      },
      'Evidence & Support': {
        high: 'Excellent use of relevant evidence and examples to support arguments.',
        medium: 'Good evidence provided, but some points need stronger support.',
        low: 'More evidence needed to support main arguments.',
      },
      'Organization': {
        high: 'Well-structured with clear progression of ideas and smooth transitions.',
        medium: 'Generally well-organized, but some sections could flow better.',
        low: 'Organization needs improvement for better clarity.',
      },
      'Grammar & Style': {
        high: 'Excellent grammar, vocabulary, and writing style throughout.',
        medium: 'Generally good writing with minor grammatical issues.',
        low: 'Several grammatical errors that affect readability.',
      },
      'Conclusion': {
        high: 'Strong conclusion that effectively summarizes and reinforces main points.',
        medium: 'Adequate conclusion but could be more impactful.',
        low: 'Conclusion needs to better tie together the essay\'s arguments.',
      },
    }

    const level = score >= 90 ? 'high' : score >= 75 ? 'medium' : 'low'
    return feedbackMap[category]?.[level] || 'Feedback available after review.'
  }

  const handleGradeEssay = () => {
    if (!essayText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter or paste the essay text',
        variant: 'destructive',
      })
      return
    }

    setIsGrading(true)
    
    // Simulate AI processing delay
    setTimeout(() => {
      const student = students[currentStudent]
      const result = simulateAIGrading(essayText, selectedRubric)
      
      const newResult: GradingResult = {
        studentId: student.id,
        studentName: `${student.last_name}, ${student.first_name}`,
        essayText,
        ...result,
      }

      setGradingResults([...gradingResults, newResult])
      setIsGrading(false)
      
      // Move to next student or finish
      if (currentStudent < students.length - 1) {
        setCurrentStudent(currentStudent + 1)
        setEssayText('')
      } else {
        toast({
          title: 'Grading Complete',
          description: `All ${students.length} essays have been graded`,
        })
      }
    }, 2000)
  }

  const updateFinalGrade = (studentId: string, grade: number) => {
    setGradingResults(gradingResults.map(r => 
      r.studentId === studentId ? { ...r, finalGrade: grade } : r
    ))
  }

  const saveAllGrades = async () => {
    try {
      const supabase = createClient()
      
      const submissions = gradingResults.map(result => ({
        assignment_id: selectedAssignment,
        student_id: result.studentId,
        ocr_text: result.essayText,
        ai_grade: {
          score: result.aiScore,
          feedback: result.feedback,
        },
        ai_confidence: { overall: result.aiConfidence },
        final_grade: result.finalGrade || result.suggestedGrade,
        status: 'finalized',
        graded_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('submissions')
        .insert(submissions)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'All grades saved successfully',
      })
    } catch (error) {
      console.error('Error saving grades:', error)
      toast({
        title: 'Error',
        description: 'Failed to save grades',
        variant: 'destructive',
      })
    }
  }

  const assignment = assignments.find(a => a.id === selectedAssignment)
  const currentStudentData = students[currentStudent]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/assignments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Essay Assistant</h1>
          <p className="text-muted-foreground">AI-powered essay grading with rubric support</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Essay Assignment</CardTitle>
          <CardDescription>Choose an essay assignment to grade</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
            <SelectTrigger>
              <SelectValue placeholder="Select an assignment" />
            </SelectTrigger>
            <SelectContent>
              {assignments.map((assignment) => (
                <SelectItem key={assignment.id} value={assignment.id}>
                  {assignment.title} - {assignment.classes?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAssignment && students.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Essay Input</CardTitle>
                <CardDescription>
                  Student: {currentStudentData?.first_name} {currentStudentData?.last_name} ({currentStudent + 1}/{students.length})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Essay Text</Label>
                  <Textarea
                    placeholder="Paste or type the essay text here..."
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    className="min-h-[300px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGradeEssay} 
                    disabled={isGrading || !essayText.trim()}
                    className="flex-1"
                  >
                    {isGrading ? (
                      <>
                        <Bot className="mr-2 h-4 w-4 animate-pulse" />
                        AI Grading...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Grade with AI
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>

                {isGrading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing essay...</span>
                      <span>Please wait</span>
                    </div>
                    <Progress value={66} className="animate-pulse" />
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedRubric && (
              <Card>
                <CardHeader>
                  <CardTitle>Grading Rubric</CardTitle>
                  <CardDescription>{selectedRubric.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(selectedRubric.criteria || [
                      { name: 'Thesis Statement', weight: 20 },
                      { name: 'Evidence & Support', weight: 30 },
                      { name: 'Organization', weight: 20 },
                      { name: 'Grammar & Style', weight: 20 },
                      { name: 'Conclusion', weight: 10 },
                    ]).map((criterion: any) => (
                      <div key={criterion.name} className="flex justify-between items-center">
                        <span className="text-sm">{criterion.name}</span>
                        <Badge variant="outline">{criterion.weight}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {gradingResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Grading Results</CardTitle>
                    <CardDescription>{gradingResults.length} essays graded</CardDescription>
                  </div>
                  <Button onClick={saveAllGrades}>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Grades
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={gradingResults[0]?.studentId}>
                  <TabsList className="grid grid-cols-3 w-full max-w-md">
                    {gradingResults.slice(0, 3).map((result) => (
                      <TabsTrigger key={result.studentId} value={result.studentId}>
                        {result.studentName.split(',')[0]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {gradingResults.map((result) => (
                    <TabsContent key={result.studentId} value={result.studentId} className="space-y-4">
                      <div className="grid gap-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{result.studentName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default">
                                AI Score: {result.aiScore.toFixed(1)}%
                              </Badge>
                              <Badge variant="outline">
                                Confidence: {result.aiConfidence}%
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>Final Grade:</Label>
                            <Input
                              type="number"
                              value={result.finalGrade || result.suggestedGrade}
                              onChange={(e) => updateFinalGrade(result.studentId, parseFloat(e.target.value))}
                              className="w-20"
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          {result.feedback.map((item, index) => (
                            <Card key={index}>
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium">{item.category}</span>
                                  <Badge variant={item.score >= item.maxScore * 0.8 ? 'default' : 'secondary'}>
                                    {item.score.toFixed(1)}/{item.maxScore}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.comments}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}