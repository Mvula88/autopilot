import Papa from 'papaparse'

export interface ParsedStudent {
  firstName: string
  lastName: string
  studentId?: string
  email?: string
  parentEmail?: string
  grades?: Record<string, any>
  [key: string]: any
}

export interface ColumnMapping {
  firstName: string
  lastName: string
  studentId?: string
  email?: string
  parentEmail?: string
  gradeColumns?: string[]
}

export function parseCSV(file: File): Promise<Papa.ParseResult<any>> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (error) => reject(error),
    })
  })
}

export function detectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    firstName: '',
    lastName: '',
  }

  // Common column name patterns
  const firstNamePatterns = /^(first[_\s]?name|fname|given[_\s]?name|student[_\s]?first)$/i
  const lastNamePatterns = /^(last[_\s]?name|lname|surname|family[_\s]?name|student[_\s]?last)$/i
  const studentIdPatterns = /^(student[_\s]?id|id|student[_\s]?number|sid)$/i
  const emailPatterns = /^(email|student[_\s]?email|e-?mail)$/i
  const parentEmailPatterns = /^(parent[_\s]?email|guardian[_\s]?email|contact[_\s]?email)$/i
  const gradePatterns = /^(grade|score|mark|assignment|test|quiz|exam)/i

  headers.forEach(header => {
    const cleanHeader = header.trim()
    
    if (firstNamePatterns.test(cleanHeader) && !mapping.firstName) {
      mapping.firstName = header
    } else if (lastNamePatterns.test(cleanHeader) && !mapping.lastName) {
      mapping.lastName = header
    } else if (studentIdPatterns.test(cleanHeader) && !mapping.studentId) {
      mapping.studentId = header
    } else if (parentEmailPatterns.test(cleanHeader) && !mapping.parentEmail) {
      mapping.parentEmail = header
    } else if (emailPatterns.test(cleanHeader) && !mapping.email) {
      mapping.email = header
    }
  })

  // Find grade columns
  mapping.gradeColumns = headers.filter(header => 
    gradePatterns.test(header.trim())
  )

  return mapping
}

export function transformStudentData(
  rawData: any[],
  mapping: ColumnMapping
): ParsedStudent[] {
  return rawData.map(row => {
    const student: ParsedStudent = {
      firstName: row[mapping.firstName] || '',
      lastName: row[mapping.lastName] || '',
    }

    if (mapping.studentId) {
      student.studentId = row[mapping.studentId]
    }

    if (mapping.email) {
      student.email = row[mapping.email]
    }

    if (mapping.parentEmail) {
      student.parentEmail = row[mapping.parentEmail]
    }

    // Collect grade data
    if (mapping.gradeColumns && mapping.gradeColumns.length > 0) {
      student.grades = {}
      mapping.gradeColumns.forEach(col => {
        const value = row[col]
        if (value !== undefined && value !== null && value !== '') {
          student.grades![col] = value
        }
      })
    }

    // Include any unmapped columns as additional data
    Object.keys(row).forEach(key => {
      if (!Object.values(mapping).flat().includes(key)) {
        student[key] = row[key]
      }
    })

    return student
  }).filter(student => student.firstName || student.lastName) // Filter out empty rows
}

export function validateStudentData(students: ParsedStudent[]): {
  valid: ParsedStudent[]
  invalid: { student: ParsedStudent; reason: string }[]
} {
  const valid: ParsedStudent[] = []
  const invalid: { student: ParsedStudent; reason: string }[] = []

  students.forEach(student => {
    if (!student.firstName && !student.lastName) {
      invalid.push({ 
        student, 
        reason: 'Missing both first and last name' 
      })
    } else if (!student.firstName) {
      invalid.push({ 
        student, 
        reason: 'Missing first name' 
      })
    } else if (!student.lastName) {
      invalid.push({ 
        student, 
        reason: 'Missing last name' 
      })
    } else if (student.email && !isValidEmail(student.email)) {
      invalid.push({ 
        student, 
        reason: 'Invalid email format' 
      })
    } else if (student.parentEmail && !isValidEmail(student.parentEmail)) {
      invalid.push({ 
        student, 
        reason: 'Invalid parent email format' 
      })
    } else {
      valid.push(student)
    }
  })

  return { valid, invalid }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateImportSummary(
  total: number,
  successful: number,
  failed: number,
  errors: { student: ParsedStudent; reason: string }[]
): string {
  const summary = [`Import Summary:
- Total rows: ${total}
- Successfully imported: ${successful}
- Failed: ${failed}`]

  if (errors.length > 0) {
    summary.push('\nErrors:')
    errors.slice(0, 5).forEach(({ student, reason }) => {
      summary.push(`- ${student.firstName} ${student.lastName}: ${reason}`)
    })
    if (errors.length > 5) {
      summary.push(`... and ${errors.length - 5} more errors`)
    }
  }

  return summary.join('\n')
}