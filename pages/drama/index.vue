<template>
  <div class="px-4 space-y-4">
    <h1 class="text-xl font-bold text-dark-900 dark:text-white">All Drama</h1>
    
    <div v-if="pending" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      <div v-for="i in 12" :key="i" class="space-y-2">
        <div class="skeleton aspect-[2/3] rounded-lg" />
        <div class="skeleton h-4 w-full" />
        <div class="skeleton h-3 w-2/3" />
      </div>
    </div>
    
    <template v-else>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        <DramaCard
          v-for="drama in dramas"
          :key="drama.id"
          :drama="drama"
          @click="playDrama(drama)"
        />
      </div>
      
      <div class="flex justify-center py-4">
        <button
          v-if="hasMore"
          class="btn-secondary text-sm"
          :disabled="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </template>
    
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
const { haptic } = useTelegram()

const dramas = ref<Drama[]>([])
const page = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)

const showPlayer = ref(false)
const selectedDrama = ref<Drama | null>(null)
const selectedEpisodes = ref<Episode[]>([])
const selectedEpisodeId = ref('')

const { data, pending } = await useAsyncData('drama-list', () => api.getDramaList(1, 24))

if (data.value) {
  dramas.value = data.value
  hasMore.value = data.value.length >= 24
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  
  loadingMore.value = true
  page.value++
  
  try {
    const newData = await api.getDramaList(page.value, 24)
    
    if (newData.length < 24) {
      hasMore.value = false
    }
    
    dramas.value.push(...newData)
  } catch (error) {
    console.error('Failed to load more:', error)
    page.value--
  } finally {
    loadingMore.value = false
  }
}

const playDrama = async (drama: Drama) => {
  try {
    haptic('light')
  } catch (e) {}
  
  selectedDrama.value = drama
  selectedEpisodeId.value = ''
  
  try {
    const episodes = await api.getEpisodes(drama.id)
    
    if (!episodes || episodes.length === 0) {
      const { showAlert } = useTelegram()
      showAlert('Maaf, episode drama ini belum tersedia.')
      return
    }
    
    selectedEpisodes.value = episodes
    
    if (selectedEpisodes.value.length > 0) {
      selectedEpisodeId.value = selectedEpisodes.value[0].id
    }
    
    showPlayer.value = true
  } catch (error) {
    console.error('Failed to load episodes:', error)
    const { showAlert } = useTelegram()
    showAlert('Gagal memuat episode. Silakan coba lagi nanti.')
  }
}

const closePlayer = () => {
  showPlayer.value = false
}
</script>
