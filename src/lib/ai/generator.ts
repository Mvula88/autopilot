import { generateWithClaude, translateContent } from './claude'
import { 
  DIGEST_SYSTEM_PROMPT, 
  QUICK_NOTE_SYSTEM_PROMPT,
  createDigestPrompt,
  createQuickNotePrompt 
} from './prompts'

export interface DigestContent {
  wins: string[]
  academic_snapshot: string
  areas_for_growth: string[]
  upcoming_work: string
  parent_support: string
}

export async function generateWeeklyDigest(
  studentData: any,
  language: string = 'en'
): Promise<DigestContent> {
  try {
    const prompt = createDigestPrompt(studentData)
    const rawContent = await generateWithClaude(DIGEST_SYSTEM_PROMPT, prompt)
    
    // Parse the JSON response
    let digestContent: DigestContent
    try {
      digestContent = JSON.parse(rawContent)
    } catch {
      // Fallback if JSON parsing fails
      digestContent = {
        wins: ['Great participation in class', 'Improved homework completion'],
        academic_snapshot: 'Overall performing at grade level',
        areas_for_growth: ['Could benefit from additional reading practice'],
        upcoming_work: 'Next week we will focus on multiplication tables',
        parent_support: 'Practice math facts for 10 minutes each evening',
      }
    }

    // Translate if needed
    if (language !== 'en') {
      const translatedContent = await translateContent(
        JSON.stringify(digestContent),
        language === 'es' ? 'Spanish' : language === 'zh' ? 'Mandarin Chinese' : language
      )
      try {
        digestContent = JSON.parse(translatedContent)
      } catch {
        // Keep English if translation fails
      }
    }

    return digestContent
  } catch (error) {
    console.error('Error generating digest:', error)
    throw new Error('Failed to generate weekly digest')
  }
}

export async function generateQuickNote(
  type: 'positive' | 'concern' | 'info',
  category: string,
  context: string,
  language: string = 'en'
): Promise<string> {
  try {
    const prompt = createQuickNotePrompt(type, category, context)
    let noteContent = await generateWithClaude(QUICK_NOTE_SYSTEM_PROMPT, prompt, 200)
    
    // Translate if needed
    if (language !== 'en') {
      noteContent = await translateContent(
        noteContent,
        language === 'es' ? 'Spanish' : language === 'zh' ? 'Mandarin Chinese' : language
      )
    }

    return noteContent
  } catch (error) {
    console.error('Error generating quick note:', error)
    throw new Error('Failed to generate quick note')
  }
}

export async function suggestParentResponse(
  communicationType: string,
  messageContent: string
): Promise<string[]> {
  const prompt = `Based on this ${communicationType} from a teacher:
"${messageContent}"

Suggest 3 brief, appropriate responses a parent might send. Keep each under 50 words.`

  try {
    const suggestions = await generateWithClaude(
      'You are helping suggest appropriate parent responses to teacher communications. Be supportive and constructive.',
      prompt,
      300
    )
    
    // Split into array of suggestions
    return suggestions.split('\n').filter(s => s.trim().length > 0).slice(0, 3)
  } catch {
    return [
      'Thank you for the update. We appreciate your communication.',
      'We will work on this at home. Please let us know if you have specific suggestions.',
      'Thank you for keeping us informed. How can we best support our child?'
    ]
  }
}