import Link from 'next/link'
import { Users, Calendar, BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ClassCardProps {
  classData: {
    id: string
    name: string
    subject?: string
    grade_level?: string
    academic_year?: string
    students?: { count: number }[]
  }
}

export default function ClassCard({ classData }: ClassCardProps) {
  const studentCount = classData.students?.[0]?.count || 0

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{classData.name}</h3>
          {classData.subject && (
            <p className="text-sm text-gray-600 mt-1">{classData.subject}</p>
          )}
        </div>
        <div className="bg-indigo-100 rounded-lg p-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {classData.grade_level && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            Grade {classData.grade_level}
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          {studentCount} {studentCount === 1 ? 'student' : 'students'}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Link href={`/classes/${classData.id}`}>
          <Button variant="ghost" size="sm">
            View Class
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/classes/${classData.id}/digest`}>
          <Button size="sm">
            Send Digest
          </Button>
        </Link>
      </div>
    </div>
  )
}