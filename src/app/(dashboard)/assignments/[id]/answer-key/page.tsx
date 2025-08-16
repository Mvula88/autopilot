'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Answer {
  question: number
  correct: string
  points: number
}

export default function AnswerKeyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [assignment, setAssignment] = useState<any>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [numberOfQuestions, setNumberOfQuestions] = useState(10)
  const [assignmentId, setAssignmentId] = useState<string>('')

  useEffect(() => {
    async function fetchAssignment() {
      const resolvedParams = await params
      setAssignmentId(resolvedParams.id)
      const supabase = createClient()
      
      const { data: assignmentData, error } = await supabase
        .from('assignments')
        .select('*, classes(*)')
        .eq('id', resolvedParams.id)
        .single()

      if (error || !assignmentData) {
        toast({
          title: 'Error',
          description: 'Assignment not found',
          variant: 'destructive',
        })
        router.push('/assignments')
        return
      }

      setAssignment(assignmentData)

      // Check if answer key already exists
      const { data: answerKey } = await supabase
        .from('answer_keys')
        .select('*')
        .eq('assignment_id', resolvedParams.id)
        .single()

      if (answerKey) {
        const existingAnswers = answerKey.answers as Answer[]
        setAnswers(existingAnswers)
        setNumberOfQuestions(existingAnswers.length)
      } else {
        // Initialize default answers
        const pointsPerQuestion = Math.floor(assignmentData.total_points / numberOfQuestions)
        const initialAnswers = Array.from({ length: numberOfQuestions }, (_, i) => ({
          question: i + 1,
          correct: 'A',
          points: pointsPerQuestion,
        }))
        setAnswers(initialAnswers)
      }
    }

    fetchAssignment()
  }, [params, numberOfQuestions, router, toast])

  const updateAnswer = (index: number, field: 'correct' | 'points', value: string | number) => {
    const newAnswers = [...answers]
    if (field === 'correct') {
      newAnswers[index].correct = value as string
    } else {
      newAnswers[index].points = value as number
    }
    setAnswers(newAnswers)
  }

  const addQuestion = () => {
    const newQuestion: Answer = {
      question: answers.length + 1,
      correct: 'A',
      points: Math.floor(assignment.total_points / (answers.length + 1)),
    }
    setAnswers([...answers, newQuestion])
  }

  const removeQuestion = (index: number) => {
    const newAnswers = answers.filter((_, i) => i !== index)
    // Renumber questions
    newAnswers.forEach((answer, i) => {
      answer.question = i + 1
    })
    setAnswers(newAnswers)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // Check if answer key exists
      const { data: existingKey } = await supabase
        .from('answer_keys')
        .select('id')
        .eq('assignment_id', assignmentId)
        .single()

      if (existingKey) {
        // Update existing answer key
        const { error } = await supabase
          .from('answer_keys')
          .update({ answers })
          .eq('id', existingKey.id)

        if (error) throw error
      } else {
        // Create new answer key
        const { error } = await supabase
          .from('answer_keys')
          .insert({
            assignment_id: assignmentId,
            answers,
          })

        if (error) throw error
      }

      toast({
        title: 'Success',
        description: 'Answer key saved successfully',
      })

      router.push('/assignments')
      router.refresh()
    } catch (error) {
      console.error('Error saving answer key:', error)
      toast({
        title: 'Error',
        description: 'Failed to save answer key. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!assignment) {
    return <div>Loading...</div>
  }

  const totalPoints = answers.reduce((sum, answer) => sum + answer.points, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/assignments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Answer Key Setup</h1>
          <p className="text-muted-foreground">{assignment.title} - {assignment.classes?.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Configure Answer Key</CardTitle>
              <CardDescription>
                Set the correct answers and point values for each question
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Points</div>
              <div className="text-2xl font-bold">
                {totalPoints} / {assignment.total_points}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {answers.map((answer, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-semibold">Question {answer.question}</Label>
                    {answers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <RadioGroup
                        value={answer.correct}
                        onValueChange={(value) => updateAnswer(index, 'correct', value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="A" id={`q${index}-a`} />
                          <Label htmlFor={`q${index}-a`}>A</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="B" id={`q${index}-b`} />
                          <Label htmlFor={`q${index}-b`}>B</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="C" id={`q${index}-c`} />
                          <Label htmlFor={`q${index}-c`}>C</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="D" id={`q${index}-d`} />
                          <Label htmlFor={`q${index}-d`}>D</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="E" id={`q${index}-e`} />
                          <Label htmlFor={`q${index}-e`}>E</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={answer.points}
                        onChange={(e) => updateAnswer(index, 'points', parseInt(e.target.value) || 0)}
                        min="0"
                        max={assignment.total_points}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={addQuestion} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={isLoading || totalPoints !== assignment.total_points}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Answer Key'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/assignments">Skip for Now</Link>
            </Button>
          </div>

          {totalPoints !== assignment.total_points && (
            <p className="text-sm text-destructive">
              Point total must equal {assignment.total_points}. Currently: {totalPoints}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}