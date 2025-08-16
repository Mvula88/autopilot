'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle, XCircle, Upload, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface StudentAnswer {
  studentId: string
  studentName: string
  answers: string[]
  score?: number
  percentage?: number
}

export default function QuickGradePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [assignments, setAssignments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [answerKey, setAnswerKey] = useState<any>(null)
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([])
  const [isGrading, setIsGrading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
          answer_keys(*)
        `)
        .eq('classes.teacher_id', user.id)
        .eq('type', 'multiple_choice')
        .order('created_at', { ascending: false })

      setAssignments(data?.filter(a => a.answer_keys?.length > 0) || [])
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
    
    // Get assignment details with answer key
    const assignment = assignments.find(a => a.id === selectedAssignment)
    if (!assignment) return

    setAnswerKey(assignment.answer_keys[0])

    // Get students in the class
    const { data: studentsData } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', assignment.class_id)
      .order('last_name')

    setStudents(studentsData || [])

    // Initialize student answers
    const initialAnswers = studentsData?.map(student => ({
      studentId: student.id,
      studentName: `${student.last_name}, ${student.first_name}`,
      answers: new Array(assignment.answer_keys[0].answers.length).fill(''),
    })) || []

    setStudentAnswers(initialAnswers)
  }

  const updateStudentAnswer = (studentIndex: number, questionIndex: number, answer: string) => {
    const newAnswers = [...studentAnswers]
    newAnswers[studentIndex].answers[questionIndex] = answer
    setStudentAnswers(newAnswers)
  }

  const gradeAll = () => {
    if (!answerKey) return

    const gradedAnswers = studentAnswers.map(student => {
      let score = 0
      const correctAnswers = answerKey.answers

      student.answers.forEach((answer, index) => {
        if (answer === correctAnswers[index].correct) {
          score += correctAnswers[index].points
        }
      })

      const assignment = assignments.find(a => a.id === selectedAssignment)
      const percentage = (score / assignment.total_points) * 100

      return {
        ...student,
        score,
        percentage,
      }
    })

    setStudentAnswers(gradedAnswers)
    setIsGrading(true)
  }

  const saveGrades = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const assignment = assignments.find(a => a.id === selectedAssignment)

      // Create submissions for each student
      const submissions = studentAnswers.map(student => ({
        assignment_id: selectedAssignment,
        student_id: student.studentId,
        final_grade: student.score || 0,
        status: 'finalized',
        ai_grade: {
          answers: student.answers,
          score: student.score,
          percentage: student.percentage,
        },
        graded_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('submissions')
        .insert(submissions)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Graded ${studentAnswers.length} submissions successfully`,
      })

      router.push('/assignments')
    } catch (error) {
      console.error('Error saving grades:', error)
      toast({
        title: 'Error',
        description: 'Failed to save grades. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const assignment = assignments.find(a => a.id === selectedAssignment)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/assignments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quick Grade</h1>
          <p className="text-muted-foreground">Grade multiple choice assignments quickly</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Assignment</CardTitle>
          <CardDescription>Choose a multiple choice assignment with an answer key</CardDescription>
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

      {selectedAssignment && answerKey && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Answer Key</CardTitle>
                  <CardDescription>{assignment?.title}</CardDescription>
                </div>
                <Badge variant="outline">
                  {answerKey.answers.length} Questions - {assignment?.total_points} Points
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                {answerKey.answers.map((answer: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-muted-foreground">Q{answer.question}</div>
                    <Badge>{answer.correct}</Badge>
                    <div className="text-xs text-muted-foreground">{answer.points}pts</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Student Answers</CardTitle>
                  <CardDescription>Enter answers for each student</CardDescription>
                </div>
                {!isGrading && (
                  <Button onClick={gradeAll} disabled={studentAnswers.some(s => s.answers.includes(''))}>
                    Grade All
                  </Button>
                )}
                {isGrading && (
                  <Button onClick={saveGrades} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Grades'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {studentAnswers.map((student, studentIndex) => (
                  <Card key={student.studentId}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{student.studentName}</CardTitle>
                        {isGrading && (
                          <div className="flex items-center gap-2">
                            <Badge variant={student.percentage! >= 70 ? 'default' : 'destructive'}>
                              {student.score}/{assignment?.total_points} ({student.percentage?.toFixed(1)}%)
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                        {answerKey.answers.map((correctAnswer: any, qIndex: number) => {
                          const studentAnswer = student.answers[qIndex]
                          const isCorrect = isGrading && studentAnswer === correctAnswer.correct
                          const isWrong = isGrading && studentAnswer && studentAnswer !== correctAnswer.correct

                          return (
                            <div key={qIndex} className="space-y-2">
                              <Label className="text-xs flex items-center gap-1">
                                Q{qIndex + 1}
                                {isCorrect && <CheckCircle className="h-3 w-3 text-green-500" />}
                                {isWrong && <XCircle className="h-3 w-3 text-red-500" />}
                              </Label>
                              <RadioGroup
                                value={studentAnswer}
                                onValueChange={(value) => updateStudentAnswer(studentIndex, qIndex, value)}
                                disabled={isGrading}
                              >
                                {['A', 'B', 'C', 'D', 'E'].map((option) => (
                                  <div key={option} className="flex items-center space-x-1">
                                    <RadioGroupItem 
                                      value={option} 
                                      id={`s${studentIndex}q${qIndex}${option}`}
                                      className="h-3 w-3"
                                    />
                                    <Label 
                                      htmlFor={`s${studentIndex}q${qIndex}${option}`}
                                      className="text-xs cursor-pointer"
                                    >
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}