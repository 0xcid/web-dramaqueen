interface TelegramMessage {
  chat_id: string
  text: string
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disable_web_page_preview?: boolean
}

interface TelegramPhoto {
  chat_id: string
  photo: string
  caption?: string
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
}

export async function sendTelegramMessage(
  botToken: string,
  message: TelegramMessage
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      }
    )

    const result = await response.json() as { ok: boolean; description?: string }
    
    if (!result.ok) {
      console.error('Telegram API error:', result.description)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Failed to send Telegram message:', error)
    return false
  }
}

export async function sendTelegramPhoto(
  botToken: string,
  photo: TelegramPhoto
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(photo)
      }
    )

    const result = await response.json() as { ok: boolean; description?: string }
    
    if (!result.ok) {
      console.error('Telegram API error:', result.description)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Failed to send Telegram photo:', error)
    return false
  }
}

export function formatNewEpisodeMessage(
  dramaTitle: string,
  episodeNumber: number,
  posterUrl: string,
  watchUrl: string
): string {
  return `🆕 <b>Episode Baru!</b>

📺 <b>${escapeHtml(dramaTitle)}</b>
Episode ${episodeNumber}

🔗 <a href="${watchUrl}">Tonton Sekarang</a>`
}

export function formatNewEpisodePhoto(
  dramaTitle: string,
  episodeNumber: number,
  watchUrl: string
): string {
  return `🆕 *Episode Baru!*

📺 *${escapeMarkdown(dramaTitle)}*
Episode ${episodeNumber}

🔗 [Tonton Sekarang](${watchUrl})`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}
