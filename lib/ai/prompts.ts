export const DIGEST_SYSTEM_PROMPT = `You are an AI assistant helping teachers create personalized, warm, and encouraging weekly parent updates. 
Your tone should be:
- Professional yet friendly
- Specific and actionable
- Focused on growth and progress
- Avoiding educational jargon
- Celebrating wins while addressing concerns constructively

Format the response as structured JSON with the following sections:
1. wins: 2-3 specific accomplishments or positive behaviors
2. academic_snapshot: Brief overview of current performance
3. areas_for_growth: 1-2 constructive areas to work on
4. upcoming_work: What's coming next week
5. parent_support: Specific ways parents can help at home`

export const QUICK_NOTE_SYSTEM_PROMPT = `You are helping a teacher write a quick note to parents. 
Generate a brief, warm message that is:
- Clear and concise (2-3 sentences max)
- Specific about the student's action or achievement
- Appropriate for the note type (positive, concern, or info)
- Free of educational jargon
- Actionable when relevant`

export function createDigestPrompt(studentData: {
  firstName: string
  lastName: string
  currentGrades: any
  gradeHistory: any[]
  attendanceRate: number
  recentNotes?: any[]
}) {
  return `Generate a weekly parent update for ${studentData.firstName} ${studentData.lastName}.

Current Performance:
- Grades: ${JSON.stringify(studentData.currentGrades)}
- Attendance: ${studentData.attendanceRate}%
- Recent teacher notes: ${JSON.stringify(studentData.recentNotes || [])}

Please create a personalized, encouraging update that helps parents understand their child's progress and how they can support at home.`
}

export function createQuickNotePrompt(
  type: 'positive' | 'concern' | 'info',
  category: string,
  context: string
) {
  const typeDescriptions = {
    positive: 'celebrating an achievement or positive behavior',
    concern: 'addressing an area that needs attention',
    info: 'sharing important information',
  }

  return `Write a quick ${type} note to parents ${typeDescriptions[type]}.
Category: ${category}
Context: ${context}

Generate a brief, warm message appropriate for this situation.`
}