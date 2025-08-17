'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteStudentButtonProps {
  studentId: string
  studentName: string
}

export default function DeleteStudentButton({ studentId, studentName }: DeleteStudentButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (error) throw error

      toast({
        title: 'Success',
        description: `${studentName} has been removed from the class`,
      })

      router.refresh()
    } catch (error) {
      console.error('Error deleting student:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove student',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Student</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {studentName} from this class? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Removing...' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}