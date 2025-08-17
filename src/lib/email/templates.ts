import { DigestContent } from '@/lib/ai/generator'

export function generateDigestEmailHTML(
  studentName: string,
  teacherName: string,
  className: string,
  content: DigestContent,
  trackingPixelUrl?: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Update for ${studentName}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #4F46E5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #1F2937;
      font-size: 24px;
      margin: 0 0 8px 0;
    }
    .subtitle {
      color: #6B7280;
      font-size: 14px;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      color: #4F46E5;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .wins {
      background: #F0FDF4;
      border-left: 4px solid #10B981;
      padding: 16px;
      border-radius: 8px;
    }
    .wins li {
      color: #065F46;
      margin: 8px 0;
    }
    .snapshot {
      background: #EFF6FF;
      padding: 16px;
      border-radius: 8px;
      color: #1E40AF;
    }
    .growth {
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 16px;
      border-radius: 8px;
    }
    .growth li {
      color: #92400E;
      margin: 8px 0;
    }
    .upcoming {
      background: #F3F4F6;
      padding: 16px;
      border-radius: 8px;
    }
    .support {
      background: #FEFCE8;
      border: 2px solid #FCD34D;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      color: #6B7280;
      font-size: 12px;
      text-align: center;
    }
    .button {
      display: inline-block;
      background: #4F46E5;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Weekly Update: ${studentName}</h1>
      <div class="subtitle">${className} • Week ending ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="section">
      <div class="section-title">🌟 Wins This Week</div>
      <div class="wins">
        <ul>
          ${content.wins.map(win => `<li>${win}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📊 Academic Snapshot</div>
      <div class="snapshot">
        ${content.academic_snapshot}
      </div>
    </div>

    <div class="section">
      <div class="section-title">🌱 Areas for Growth</div>
      <div class="growth">
        <ul>
          ${content.areas_for_growth.map(area => `<li>${area}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📅 Coming Up Next Week</div>
      <div class="upcoming">
        ${content.upcoming_work}
      </div>
    </div>

    <div class="support">
      <div class="section-title">🏠 How You Can Help at Home</div>
      <p>${content.parent_support}</p>
    </div>

    <div class="footer">
      <p>Best regards,<br><strong>${teacherName}</strong></p>
      <p>This update was generated to save teacher time while keeping you informed.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/parent/preferences" class="button">Update Preferences</a>
    </div>
  </div>
  ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="">` : ''}
</body>
</html>
  `
}

export function generateQuickNoteEmailHTML(
  studentName: string,
  teacherName: string,
  noteType: 'positive' | 'concern' | 'info',
  message: string,
  trackingPixelUrl?: string
): string {
  const typeConfig = {
    positive: { emoji: '🌟', color: '#10B981', bg: '#F0FDF4', title: 'Positive Update' },
    concern: { emoji: '⚠️', color: '#F59E0B', bg: '#FEF3C7', title: 'Needs Attention' },
    info: { emoji: 'ℹ️', color: '#3B82F6', bg: '#EFF6FF', title: 'Information' },
  }

  const config = typeConfig[noteType]

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quick Note about ${studentName}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid ${config.color};
    }
    .emoji {
      font-size: 32px;
    }
    .title {
      color: ${config.color};
      font-size: 18px;
      font-weight: 600;
    }
    .message {
      background: ${config.bg};
      padding: 20px;
      border-radius: 8px;
      font-size: 16px;
      line-height: 1.7;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #E5E7EB;
      color: #6B7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="emoji">${config.emoji}</span>
      <div>
        <div class="title">${config.title}: ${studentName}</div>
        <div style="font-size: 14px; color: #6B7280;">${new Date().toLocaleDateString()}</div>
      </div>
    </div>

    <div class="message">
      ${message}
    </div>

    <div class="footer">
      <p>Best regards,<br><strong>${teacherName}</strong></p>
      <p style="font-size: 12px;">Questions? Feel free to reply to this email.</p>
    </div>
  </div>
  ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="">` : ''}
</body>
</html>
  `
}

export function generatePlainTextDigest(
  studentName: string,
  teacherName: string,
  className: string,
  content: DigestContent
): string {
  return `
Weekly Update: ${studentName}
${className} • Week ending ${new Date().toLocaleDateString()}

WINS THIS WEEK:
${content.wins.map(win => `• ${win}`).join('\n')}

ACADEMIC SNAPSHOT:
${content.academic_snapshot}

AREAS FOR GROWTH:
${content.areas_for_growth.map(area => `• ${area}`).join('\n')}

COMING UP NEXT WEEK:
${content.upcoming_work}

HOW YOU CAN HELP AT HOME:
${content.parent_support}

Best regards,
${teacherName}

Update your preferences: ${process.env.NEXT_PUBLIC_APP_URL}/parent/preferences
  `
}