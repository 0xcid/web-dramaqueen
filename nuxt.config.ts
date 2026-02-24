export default defineNuxtConfig({
  compatibilityDate: '2025-02-01',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    'nitro-cloudflare-dev'
  ],
  
  nitro: {
    preset: 'cloudflare_pages',
    prerender: {
      autoSubfolderIndex: false
    }
  },
  
  runtimeConfig: {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChannelId: process.env.TELEGRAM_CHANNEL_ID || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://dramaqueen.iseries.my.id/api'
    }
  },
  
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js'
  },
  
  app: {
    head: {
      title: 'DramaQueen - Streaming Drama Korea',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#1a1a2e' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      script: [
        { src: 'https://telegram.org/js/telegram-web-app.js', defer: true }
      ]
    }
  },
  
  css: ['~/assets/css/main.css']
})
