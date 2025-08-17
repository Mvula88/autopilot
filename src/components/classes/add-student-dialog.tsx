'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddStudentDialog({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name) {
      toast({
        title: 'Error',
        description: 'First and last name are required',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('students').insert({
        class_id: classId,
        ...formData,
      })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Student added successfully',
      })

      setOpen(false)
      setFormData({
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
      })
      router.refresh()
    } catch (error) {
      console.error('Error adding student:', error)
      toast({
        title: 'Error',
        description: 'Failed to add student',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Add a new student to this class. Fill in the student details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student_id" className="text-right">
              Student ID
            </Label>
            <Input
              id="student_id"
              value={formData.student_id}
              onChange={(e) =>
                setFormData({ ...formData, student_id: e.target.value })
              }
              className="col-span-3"
              placeholder="Optional"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="first_name" className="text-right">
              First Name
            </Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="last_name" className="text-right">
              Last Name
            </Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="col-span-3"
              placeholder="Optional"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}