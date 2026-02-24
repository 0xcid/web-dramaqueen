import { getOngoingDramas, getDramaEpisodes, type Drama } from '~/server/utils/dramaApi'
import { 
  sendTelegramPhoto, 
  formatNewEpisodePhoto 
} from '~/server/utils/telegram'

interface DramaState {
  lastEpisodeCount: number
  lastChecked: string
}

interface StoredState {
  [dramaId: string]: DramaState
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const context = event.context
  
  const botToken = config.telegramBotToken || context.cloudflare?.env?.TELEGRAM_BOT_TOKEN
  const channelId = config.telegramChannelId || context.cloudflare?.env?.TELEGRAM_CHANNEL_ID
  const kv = context.cloudflare?.env?.DRAMA_KV
  
  if (!botToken || !channelId) {
    console.error('Missing Telegram configuration')
    return {
      success: false,
      error: 'Missing Telegram configuration'
    }
  }
  
  const baseUrl = config.public.apiBase?.replace('/api', '') || 'https://your-domain.pages.dev'
  
  let storedState: StoredState = {}
  
  if (kv) {
    try {
      const stateData = await kv.get('drama_state')
      if (stateData) {
        storedState = JSON.parse(stateData)
      }
    } catch (error) {
      console.error('Failed to read from KV:', error)
    }
  }
  
  const ongoingDramas = await getOngoingDramas()
  const notifications: { drama: Drama; newEpisodes: number }[] = []
  
  for (const drama of ongoingDramas) {
    try {
      const episodes = await getDramaEpisodes(drama.id)
      const currentEpisodeCount = episodes.length
      
      const prevState = storedState[drama.id]
      
      if (prevState && currentEpisodeCount > prevState.lastEpisodeCount) {
        const newEpisodesCount = currentEpisodeCount - prevState.lastEpisodeCount
        
        const latestEpisodes = episodes.slice(-newEpisodesCount)
        
        for (const ep of latestEpisodes.reverse()) {
          const watchUrl = `${baseUrl}/drama/${drama.id}?play=${ep.id}`
          
          const caption = formatNewEpisodePhoto(
            drama.title,
            ep.episodeNumber,
            watchUrl
          )
          
          await sendTelegramPhoto(botToken, {
            chat_id: channelId,
            photo: drama.poster,
            caption,
            parse_mode: 'MarkdownV2'
          })
          
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        notifications.push({
          drama,
          newEpisodes: newEpisodesCount
        })
      }
      
      storedState[drama.id] = {
        lastEpisodeCount: currentEpisodeCount,
        lastChecked: new Date().toISOString()
      }
      
    } catch (error) {
      console.error(`Failed to process drama ${drama.id}:`, error)
    }
  }
  
  if (kv) {
    try {
      await kv.put('drama_state', JSON.stringify(storedState))
    } catch (error) {
      console.error('Failed to write to KV:', error)
    }
  }
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    ongoingDramasCount: ongoingDramas.length,
    notificationsSent: notifications.length,
    notifications: notifications.map(n => ({
      title: n.drama.title,
      newEpisodes: n.newEpisodes
    }))
  }
})
