<template>
  <div class="px-4 space-y-4">
    <h1 class="text-xl font-bold text-dark-900 dark:text-white">Favorites</h1>
    
    <div v-if="favorites.length === 0" class="flex flex-col items-center justify-center py-12 text-dark-500 dark:text-dark-400">
      <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
      <p>No favorites yet</p>
      <p class="text-sm mt-1">Tap the heart icon on a drama to add it here</p>
    </div>
    
    <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      <DramaCard
        v-for="item in favorites"
        :key="item.dramaId"
        :drama="item.drama"
        @click="playDrama(item.drama)"
      />
    </div>
    
    <PlayModal
      :show="showPlayer"
      :drama="selectedDrama"
      :episodes="selectedEpisodes"
      :episode-id="selectedEpisodeId"
      @close="closePlayer"
    />
  </div>
</template>

<script setup lang="ts">
import type { Drama, Episode } from '~/types'

const api = useApi()
const { favorites } = useFavorites()
const { haptic } = useTelegram()

const showPlayer = ref(false)
const selectedDrama = ref<Drama | null>(null)
const selectedEpisodes = ref<Episode[]>([])
const selectedEpisodeId = ref('')

const playDrama = async (drama: Drama) => {
  haptic('light')
  selectedDrama.value = drama
  selectedEpisodeId.value = ''
  
  try {
    selectedEpisodes.value = await api.getEpisodes(drama.id)
    
    if (selectedEpisodes.value.length > 0) {
      selectedEpisodeId.value = selectedEpisodes.value[0].id
    }
    
    showPlayer.value = true
  } catch (error) {
    console.error('Failed to load episodes:', error)
  }
}

const closePlayer = () => {
  showPlayer.value = false
}

useHead(() => ({
  title: 'Favorites'
}))
</script>
