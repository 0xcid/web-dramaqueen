export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    const url = getRequestURL(event)
    
    if (url.pathname === '/__scheduled' || url.pathname === '/api/cron/notify') {
      const authHeader = getHeader(event, 'authorization')
      const cronSecret = process.env.CRON_SECRET || ''
      
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        if (url.pathname === '/__scheduled') {
          console.log('Scheduled task triggered by Cloudflare Cron')
        }
      }
    }
  })
})
