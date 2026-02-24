import type { Drama, FavoriteItem } from '~/types'

const FAVORITES_KEY = 'dramaqueen_favorites'

const favorites = ref<FavoriteItem[]>([])

export const useFavorites = () => {
  const isLoaded = ref(false)
  
  const loadFavorites = () => {
    if (import.meta.client && !isLoaded.value) {
      try {
        const stored = localStorage.getItem(FAVORITES_KEY)
        if (stored) {
          favorites.value = JSON.parse(stored)
        }
        isLoaded.value = true
      } catch (e) {
        console.error('Failed to load favorites:', e)
      }
    }
  }
  
  const saveFavorites = () => {
    if (import.meta.client) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
      } catch (e) {
        console.error('Failed to save favorites:', e)
      }
    }
  }
  
  const addFavorite = (drama: Drama) => {
    const exists = favorites.value.some(f => f.dramaId === drama.id)
    if (!exists) {
      favorites.value.unshift({
        dramaId: drama.id,
        drama,
        addedAt: new Date().toISOString()
      })
      saveFavorites()
    }
  }
  
  const removeFavorite = (dramaId: string) => {
    const index = favorites.value.findIndex(f => f.dramaId === dramaId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
    }
  }
  
  const isFavorite = (dramaId: string) => {
    return favorites.value.some(f => f.dramaId === dramaId)
  }
  
  const toggleFavorite = (drama: Drama) => {
    if (isFavorite(drama.id)) {
      removeFavorite(drama.id)
    } else {
      addFavorite(drama)
    }
  }
  
  const clearFavorites = () => {
    favorites.value = []
    saveFavorites()
  }
  
  if (import.meta.client) {
    loadFavorites()
  }
  
  return {
    favorites: readonly(favorites),
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites
  }
}
