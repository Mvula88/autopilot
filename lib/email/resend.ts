import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  tags?: { name: string; value: string }[]
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || `${process.env.RESEND_FROM_NAME || 'Parent Communication'} <${process.env.RESEND_FROM_EMAIL || 'noreply@parentcomm.app'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
      tags: options.tags,
    })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export async function sendBulkEmails(emails: EmailOptions[]) {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  )

  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success)
  const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))

  return {
    sent: successful.length,
    failed: failed.length,
    total: emails.length,
    results,
  }
}