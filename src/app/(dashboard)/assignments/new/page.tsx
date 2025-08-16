'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  class_id: z.string().min(1, 'Please select a class'),
  title: z.string().min(1, 'Assignment title is required'),
  type: z.enum(['multiple_choice', 'short_answer', 'essay']),
  total_points: z.string().min(1, 'Total points is required'),
  due_date: z.string().optional(),
  rubric_id: z.string().optional(),
})

export default function NewAssignmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [rubrics, setRubrics] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class_id: '',
      title: '',
      type: 'multiple_choice',
      total_points: '',
      due_date: '',
      rubric_id: '',
    },
  })

  const assignmentType = form.watch('type')

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Fetch classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('name')

      setClasses(classesData || [])

      // Fetch rubrics for essays
      const { data: rubricsData } = await supabase
        .from('rubrics')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('type', 'essay')
        .order('name')

      setRubrics(rubricsData || [])
    }

    fetchData()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      const assignmentData = {
        class_id: values.class_id,
        title: values.title,
        type: values.type,
        total_points: parseInt(values.total_points),
        due_date: values.due_date || null,
        rubric_id: values.type === 'essay' && values.rubric_id ? values.rubric_id : null,
      }

      const { data: assignment, error } = await supabase
        .from('assignments')
        .insert(assignmentData)
        .select()
        .single()

      if (error) throw error

      // If it's multiple choice, redirect to answer key setup
      if (values.type === 'multiple_choice') {
        router.push(`/assignments/${assignment.id}/answer-key`)
      } else {
        toast({
          title: 'Success',
          description: 'Assignment created successfully',
        })
        router.push('/assignments')
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error creating assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to create assignment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/assignments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Assignment</h1>
          <p className="text-muted-foreground">Set up a new assignment for your class</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>Configure your assignment settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="class_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - {cls.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose which class this assignment is for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chapter 5 Quiz" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive title for your assignment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of questions in this assignment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Points</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum points for this assignment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      When this assignment is due
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {assignmentType === 'essay' && (
                <FormField
                  control={form.control}
                  name="rubric_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grading Rubric (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a rubric" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No rubric</SelectItem>
                          {rubrics.map((rubric) => (
                            <SelectItem key={rubric.id} value={rubric.id}>
                              {rubric.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose a rubric for AI-assisted grading
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : (
                    assignmentType === 'multiple_choice' ? (
                      <>
                        Next: Answer Key
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : 'Create Assignment'
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/assignments">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}