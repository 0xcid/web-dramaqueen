export interface Drama {
  id: string
  title: string
  slug: string
  poster: string
  backdrop?: string
  rating?: string
  year?: string
  status?: string
  episodeCount?: number
  synopsis?: string
  genre?: string[]
  country?: string
  type?: string
  createdAt?: string
  updatedAt?: string
}

export interface Episode {
  id: string
  dramaId: string
  episodeNumber: number
  title?: string
  videoUrl?: string
  link_720_premium?: string
  link_480?: string
  link_360?: string
  duration?: string
  createdAt?: string
}

export interface DramaDetail extends Drama {
  episodes?: Episode[]
  cast?: Cast[]
  genres?: string[]
  totalEpisodes?: number
  status?: string
  network?: string
  airDay?: string
  synopsis?: string
}

export interface Cast {
  id: string
  name: string
  character: string
  image?: string
}

export interface ApiResult<T> {
  success: boolean
  status: number
  message?: string
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface HomeData {
  popular: Drama[]
  latest: Drama[]
}

export interface HistoryItem {
  dramaId: string
  drama: Drama
  episodeId: string
  episodeNumber: number
  progress: number
  lastWatched: string
}

export interface FavoriteItem {
  dramaId: string
  drama: Drama
  addedAt: string
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    auth_date?: number
    hash?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  close: () => void
  expand: () => void
  ready: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  showPopup: (params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string, callback?: (status: string) => void) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export {}
