import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatGrade(grade: number | string): string {
  if (typeof grade === 'number') {
    return `${grade.toFixed(1)}%`
  }
  return grade
}

export function formatAttendance(rate: number): {
  text: string
  color: string
} {
  const percentage = rate.toFixed(1)
  
  if (rate >= 95) {
    return { text: `${percentage}% (Excellent)`, color: 'text-green-600' }
  } else if (rate >= 90) {
    return { text: `${percentage}% (Good)`, color: 'text-blue-600' }
  } else if (rate >= 80) {
    return { text: `${percentage}% (Needs Improvement)`, color: 'text-yellow-600' }
  } else {
    return { text: `${percentage}% (Concerning)`, color: 'text-red-600' }
  }
}

export function getGradeColor(grade: number): string {
  if (grade >= 90) return 'text-green-600'
  if (grade >= 80) return 'text-blue-600'
  if (grade >= 70) return 'text-yellow-600'
  if (grade >= 60) return 'text-orange-600'
  return 'text-red-600'
}

export function getLetterGrade(percentage: number): string {
  if (percentage >= 93) return 'A'
  if (percentage >= 90) return 'A-'
  if (percentage >= 87) return 'B+'
  if (percentage >= 83) return 'B'
  if (percentage >= 80) return 'B-'
  if (percentage >= 77) return 'C+'
  if (percentage >= 73) return 'C'
  if (percentage >= 70) return 'C-'
  if (percentage >= 67) return 'D+'
  if (percentage >= 63) return 'D'
  if (percentage >= 60) return 'D-'
  return 'F'
}

export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`)
}

export function formatTimeSaved(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} ${pluralize(minutes, 'minute')}`
  }
  return `${hours.toFixed(1)} ${pluralize(hours, 'hour')}`
}

export function getEngagementLevel(score: number): {
  level: string
  color: string
  icon: string
} {
  if (score >= 80) {
    return { level: 'Highly Engaged', color: 'text-green-600', icon: '🌟' }
  } else if (score >= 60) {
    return { level: 'Engaged', color: 'text-blue-600', icon: '👍' }
  } else if (score >= 40) {
    return { level: 'Moderately Engaged', color: 'text-yellow-600', icon: '📊' }
  } else if (score >= 20) {
    return { level: 'Low Engagement', color: 'text-orange-600', icon: '⚠️' }
  } else {
    return { level: 'Not Engaged', color: 'text-red-600', icon: '❌' }
  }
}