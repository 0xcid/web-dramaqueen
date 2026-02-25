<template>
  <div v-if="drama" class="space-y-4">
    <div class="relative">
      <img
        v-if="drama.backdrop"
        :src="drama.backdrop"
        :alt="drama.title"
        class="w-full aspect-video object-cover"
      />
      <img
        v-else
        :src="drama.poster"
        :alt="drama.title"
        class="w-full aspect-video object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />
      
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <div class="flex gap-4">
          <img
            :src="drama.poster"
            :alt="drama.title"
            class="w-24 rounded-lg shadow-lg flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <h1 class="text-xl font-bold text-white line-clamp-2">{{ drama.title }}</h1>
            <div class="flex flex-wrap items-center gap-2 mt-2 text-sm text-dark-300">
              <span v-if="drama.year">{{ drama.year }}</span>
              <span v-if="drama.rating" class="flex items-center gap-1">
                <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {{ drama.rating }}
              </span>
              <span v-if="drama.status" class="px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 text-xs">
                {{ drama.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="px-4 flex gap-2">
      <button
        class="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
        @click="playFirstEpisode"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        Play
      </button>
      
      <button
        class="p-3 rounded-xl transition-colors"
        :class="isFavorite(drama.id) ? 'bg-primary-500 text-white' : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400'"
        @click="toggleFavorite(drama)"
      >
        <svg
          class="w-5 h-5"
          :fill="isFavorite(drama.id) ? 'currentColor' : 'none'"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </button>
    </div>
    
    <div class="px-4 space-y-4">
      <div v-if="drama.synopsis" class="space-y-2">
        <h2 class="font-semibold text-dark-900 dark:text-white">Synopsis</h2>
        <p class="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">{{ drama.synopsis }}</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div v-if="drama.genres?.length">
          <span class="text-dark-500 dark:text-dark-400">Genre:</span>
          <span class="text-dark-900 dark:text-white ml-1">{{ drama.genres.join(', ') }}</span>
        </div>
        <div v-if="drama.country">
          <span class="text-dark-500 dark:text-dark-400">Country:</span>
          <span class="text-dark-900 dark:text-white ml-1">{{ drama.country }}</span>
        </div>
        <div v-if="drama.totalEpisodes">
          <span class="text-dark-500 dark:text-dark-400">Episodes:</span>
          <span class="text-dark-900 dark:text-white ml-1">{{ drama.totalEpisodes }}</span>
        </div>
        <div v-if="drama.status">
          <span class="text-dark-500 dark:text-dark-400">Status:</span>
          <span class="text-dark-900 dark:text-white ml-1">{{ drama.status }}</span>
        </div>
      </div>
    </div>
    
    <div class="px-4">
      <EpisodeList
        :episodes="episodes"
        :current-episode-id="historyItem?.episodeId"
        :watched-episodes="watchedEpisodes"
        @select="playEpisode"
      />
    </div>
  </div>
  
  <div v-else-if="pending" class="p-4 space-y-4">
    <div class="skeleton aspect-video rounded-lg" />
    <div class="skeleton h-8 w-3/4" />
    <div class="skeleton h-4 w-1/2" />
  </div>
  
  <div v-else class="p-4 text-center text-dark-500 dark:text-dark-400">
    Drama not found
  </div>
</template>

<script setup lang="ts">
import type { DramaDetail, Episode } from '~/types'

const route = useRoute()
const api = useApi()
const { isFavorite, toggleFavorite } = useFavorites()
const { getHistoryItem } = useHistory()
const { haptic, showBackButton, hideBackButton } = useTelegram()

const drama = ref<DramaDetail | null>(null)
const episodes = ref<Episode[]>([])
const showPlayer = ref(false)
const selectedEpisodeId = ref('')

const { pending } = await useAsyncData(`drama-${route.params.id}`, async () => {
  const [dramaData, episodesData] = await Promise.all([
    api.getDramaDetail(route.params.id as string),
    api.getEpisodes(route.params.id as string)
  ])
  drama.value = dramaData
  episodes.value = episodesData
  return { drama: dramaData, episodes: episodesData }
})

const historyItem = computed(() => {
  if (!drama.value) return null
  return getHistoryItem(drama.value.id)
})

const watchedEpisodes = computed(() => {
  if (!historyItem.value) return []
  return Array.from({ length: historyItem.value.episodeNumber }, (_, i) => i + 1)
})

const playFirstEpisode = () => {
  if (episodes.value.length > 0) {
    playEpisode(episodes.value[0])
  }
}

const playEpisode = (episode: Episode) => {
  try { haptic('light') } catch (e) {}
  navigateTo(`/watch/${route.params.id}?ep=${episode.id}`)
}

onMounted(() => {
  showBackButton(() => {
    navigateTo('/')
  })
})

onUnmounted(() => {
  hideBackButton()
})

useHead(() => ({
  title: drama.value?.title || 'Loading...'
}))
</script>
