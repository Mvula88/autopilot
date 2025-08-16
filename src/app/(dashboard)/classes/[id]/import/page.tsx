'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, FileSpreadsheet, Check, X } from 'lucide-react'
import Link from 'next/link'

interface Student {
  student_id?: string
  first_name: string
  last_name: string
  email?: string
}

export default function ImportCSVPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isImporting, setIsImporting] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [hasHeaders, setHasHeaders] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const [classId, setClassId] = useState<string>('')

  const processCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const data: Student[] = []
    
    const startIndex = hasHeaders ? 1 : 0
    
    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim().replace(/^"|"$/g, ''))
      
      if (values.length >= 2) {
        data.push({
          student_id: values[0] || undefined,
          first_name: values[1] || '',
          last_name: values[2] || '',
          email: values[3] || undefined,
        })
      }
    }
    
    setStudents(data)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: 'Error',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      processCSV(text)
    }
    reader.readAsText(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index))
  }

  React.useEffect(() => {
    params.then(p => setClassId(p.id))
  }, [params])

  const handleImport = async () => {
    if (students.length === 0) {
      toast({
        title: 'Error',
        description: 'No students to import',
        variant: 'destructive',
      })
      return
    }

    setIsImporting(true)
    try {
      const supabase = createClient()
      
      const studentsToInsert = students.map(student => ({
        class_id: classId,
        ...student,
      }))

      const { error } = await supabase
        .from('students')
        .insert(studentsToInsert)

      if (error) throw error

      toast({
        title: 'Success',
        description: `${students.length} students imported successfully`,
      })

      router.push(`/classes/${classId}`)
      router.refresh()
    } catch (error: any) {
      console.error('Error importing students:', error)
      if (error.code === '23505') {
        toast({
          title: 'Error',
          description: 'Some students already exist in this class. Please check for duplicates.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to import students. Please try again.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/classes/${classId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Students</h1>
          <p className="text-muted-foreground">Upload a CSV file to add multiple students at once</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format</CardTitle>
          <CardDescription>
            Your CSV file should have the following columns in order: Student ID, First Name, Last Name, Email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div>student_id,first_name,last_name,email</div>
              <div>12345,John,Doe,john.doe@school.edu</div>
              <div>12346,Jane,Smith,jane.smith@school.edu</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasHeaders"
                checked={hasHeaders}
                onChange={(e) => setHasHeaders(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="hasHeaders" className="text-sm">
                First row contains headers
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your CSV file here, or
            </p>
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-primary hover:underline">browse to upload</span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileInput}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Preview</CardTitle>
                <CardDescription>{students.length} students to import</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStudents([])}>
                  Clear All
                </Button>
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting ? 'Importing...' : `Import ${students.length} Students`}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell>{student.student_id || '-'}</TableCell>
                    <TableCell>{student.first_name}</TableCell>
                    <TableCell>{student.last_name}</TableCell>
                    <TableCell>{student.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStudent(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}