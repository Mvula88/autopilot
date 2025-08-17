import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1500
) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    return response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error('Failed to generate content with Claude')
  }
}

export async function translateContent(
  content: string,
  targetLanguage: string
) {
  const systemPrompt = `You are a professional translator specializing in educational content. 
  Translate the following content to ${targetLanguage}. 
  Maintain a warm, friendly tone appropriate for parent-teacher communication.
  Preserve all formatting and structure.`

  return generateWithClaude(systemPrompt, content)
}