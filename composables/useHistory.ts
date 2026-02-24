import type { Drama, Episode, HistoryItem } from '~/types'

const HISTORY_KEY = 'dramaqueen_history'
const MAX_HISTORY = 50

const history = ref<HistoryItem[]>([])

export const useHistory = () => {
  const isLoaded = ref(false)
  
  const loadHistory = () => {
    if (import.meta.client && !isLoaded.value) {
      try {
        const stored = localStorage.getItem(HISTORY_KEY)
        if (stored) {
          history.value = JSON.parse(stored)
        }
        isLoaded.value = true
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }
  
  const saveHistory = () => {
    if (import.meta.client) {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
      } catch (e) {
        console.error('Failed to save history:', e)
      }
    }
  }
  
  const addToHistory = (drama: Drama, episode: Episode, progress = 0) => {
    const existingIndex = history.value.findIndex(h => h.dramaId === drama.id)
    
    const item: HistoryItem = {
      dramaId: drama.id,
      drama,
      episodeId: episode.id,
      episodeNumber: episode.episodeNumber,
      progress,
      lastWatched: new Date().toISOString()
    }
    
    if (existingIndex > -1) {
      history.value.splice(existingIndex, 1)
    }
    
    history.value.unshift(item)
    
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    
    saveHistory()
  }
  
  const updateProgress = (dramaId: string, progress: number) => {
    const item = history.value.find(h => h.dramaId === dramaId)
    if (item) {
      item.progress = progress
      item.lastWatched = new Date().toISOString()
      saveHistory()
    }
  }
  
  const updateEpisode = (dramaId: string, episodeId: string, episodeNumber: number) => {
    const item = history.value.find(h => h.dramaId === dramaId)
    if (item) {
      item.episodeId = episodeId
      item.episodeNumber = episodeNumber
      item.lastWatched = new Date().toISOString()
      saveHistory()
    }
  }
  
  const getHistoryItem = (dramaId: string) => {
    return history.value.find(h => h.dramaId === dramaId)
  }
  
  const removeFromHistory = (dramaId: string) => {
    const index = history.value.findIndex(h => h.dramaId === dramaId)
    if (index > -1) {
      history.value.splice(index, 1)
      saveHistory()
    }
  }
  
  const clearHistory = () => {
    history.value = []
    saveHistory()
  }
  
  const continueWatching = computed(() => {
    return history.value.filter(h => h.progress > 0 && h.progress < 95)
  })
  
  if (import.meta.client) {
    loadHistory()
  }
  
  return {
    history: readonly(history),
    continueWatching,
    addToHistory,
    updateProgress,
    updateEpisode,
    getHistoryItem,
    removeFromHistory,
    clearHistory
  }
}
