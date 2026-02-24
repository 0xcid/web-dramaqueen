import type { TelegramUser, TelegramWebApp } from '~/types'

const user = ref<TelegramUser | null>(null)
const isReady = ref(false)
const isTelegram = ref(false)
const telegramTheme = ref<'light' | 'dark'>('dark')

let webAppInstance: TelegramWebApp | null = null

export const useTelegram = () => {
  const init = () => {
    if (import.meta.client && window.Telegram?.WebApp) {
      webAppInstance = window.Telegram.WebApp
      isTelegram.value = true
      
      webAppInstance.ready()
      isReady.value = true
      
      if (webAppInstance.initDataUnsafe?.user) {
        user.value = webAppInstance.initDataUnsafe.user
      }
      
      telegramTheme.value = webAppInstance.colorScheme || 'dark'
      
      webAppInstance.expand()
      
      if (webAppInstance.themeParams.bg_color) {
        document.documentElement.style.setProperty('--tg-bg-color', webAppInstance.themeParams.bg_color)
      }
      if (webAppInstance.themeParams.text_color) {
        document.documentElement.style.setProperty('--tg-text-color', webAppInstance.themeParams.text_color)
      }
      
      return true
    }
    
    isTelegram.value = false
    isReady.value = true
    return false
  }
  
  const haptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (webAppInstance?.HapticFeedback) {
      webAppInstance.HapticFeedback.impactOccurred(style)
    }
  }
  
  const notify = (type: 'error' | 'success' | 'warning') => {
    if (webAppInstance?.HapticFeedback) {
      webAppInstance.HapticFeedback.notificationOccurred(type)
    }
  }
  
  const showAlert = (message: string) => {
    return new Promise<void>((resolve) => {
      if (webAppInstance?.showAlert) {
        webAppInstance.showAlert(message, resolve)
      } else {
        alert(message)
        resolve()
      }
    })
  }
  
  const showConfirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      if (webAppInstance?.showConfirm) {
        webAppInstance.showConfirm(message, resolve)
      } else {
        resolve(confirm(message))
      }
    })
  }
  
  const close = () => {
    if (webAppInstance?.close) {
      webAppInstance.close()
    }
  }
  
  const openLink = (url: string) => {
    if (webAppInstance?.openLink) {
      webAppInstance.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }
  
  const showBackButton = (callback: () => void) => {
    if (webAppInstance?.BackButton) {
      webAppInstance.BackButton.show()
      webAppInstance.BackButton.onClick(callback)
    }
  }
  
  const hideBackButton = () => {
    if (webAppInstance?.BackButton) {
      webAppInstance.BackButton.hide()
    }
  }
  
  if (import.meta.client && !isReady.value) {
    onMounted(() => {
      init()
    })
  }
  
  return {
    user: readonly(user),
    isReady: readonly(isReady),
    isTelegram: readonly(isTelegram),
    theme: readonly(telegramTheme),
    init,
    haptic,
    notify,
    showAlert,
    showConfirm,
    close,
    openLink,
    showBackButton,
    hideBackButton
  }
}
