<template>
  <div class="min-h-screen bg-dark-950 flex flex-col">
    <!-- Skeleton Loading State -->
    <template v-if="pending">
      <div class="w-full aspect-video bg-dark-900 skeleton" />
      <div class="p-4 space-y-3">
        <div class="skeleton h-6 w-3/4 rounded" />
        <div class="skeleton h-4 w-1/3 rounded" />
        <div class="flex gap-2 mt-4">
          <div v-for="i in 8" :key="i" class="skeleton w-12 h-12 rounded-lg flex-shrink-0" />
        </div>
      </div>
    </template>

    <!-- Error State -->
    <div v-else-if="!drama" class="flex flex-col items-center justify-center min-h-screen gap-4 text-dark-400">
      <svg class="w-16 h-16 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p class="text-lg font-medium">Drama tidak ditemukan</p>
      <NuxtLink to="/" class="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
        Kembali ke Beranda
      </NuxtLink>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Video Player -->
      <div class="w-full bg-black relative aspect-video">
        <div v-if="isLoadingEpisode" class="absolute inset-0 flex items-center justify-center z-10 bg-black">
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 border-4 border-primary-500/20 rounded-full" />
            <div class="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>

        <VideoPlayer
          v-if="videoUrl"
          :key="videoUrl"
          :src="videoUrl"
          :poster="drama?.backdrop || drama?.poster"
          :qualities="qualityOptions"
          :title="drama?.title"
          :episodeText="currentEpisode ? `Episode ${currentEpisode.episodeNumber}` : ''"
          :episodes="episodes"
          :currentEpisodeId="currentEpisode?.id"
          @progress="onProgress"
          @ended="onEnded"
          @next="nextEpisode && selectEpisode(nextEpisode)"
          @previous="prevEpisode && selectEpisode(prevEpisode)"
          @back="navigateTo(`/drama/${route.params.id}`)"
          @selectEpisode="selectEpisode"
        />

        <!-- No Video Available -->
        <div v-if="!videoUrl && !isLoadingEpisode" class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-dark-400">
          <svg class="w-16 h-16 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
          </svg>
          <p class="text-sm">Video tidak tersedia untuk episode ini</p>
        </div>
      </div>

      <!-- Episode Info & Controls -->
      <div class="flex-1 overflow-y-auto pb-24">
        <!-- Title Bar -->
        <div class="p-4 flex items-center justify-between gap-3 border-b border-dark-800">
          <div class="flex-1 min-w-0">
            <h1 class="text-base font-bold text-white truncate">{{ drama.title }}</h1>
            <p class="text-sm text-dark-400">Episode {{ currentEpisode?.episodeNumber ?? '—' }}</p>
          </div>
          <!-- Favorite Button -->
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border text-xs font-semibold"
            :class="isCurrentDramaFavorite
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-dark-800 text-dark-300 border-dark-700 hover:text-white'"
            @click="onFavoriteClick"
          >
            <svg v-if="isCurrentDramaFavorite" class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {{ isCurrentDramaFavorite ? 'Favorit' : 'Favorit' }}
          </button>
        </div>

        <!-- Episode List -->
        <div class="p-4 space-y-3">
          <h2 class="text-sm font-semibold text-white">Episodes</h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="ep in episodes"
              :key="ep.id"
              class="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
              :class="[
                currentEpisode?.id === ep.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
              ]"
              @click="selectEpisode(ep)"
            >
              {{ ep.episodeNumber }}
            </button>
          </div>

          <!-- Prev / Next Nav -->
          <div class="flex items-center gap-3 pt-2">
            <button
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm"
              :class="prevEpisode ? 'bg-dark-800 text-white hover:bg-dark-700' : 'bg-dark-800/40 text-dark-600 cursor-not-allowed'"
              :disabled="!prevEpisode"
              @click="prevEpisode && selectEpisode(prevEpisode)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Previous
            </button>
            <button
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm"
              :class="nextEpisode ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-dark-800/40 text-dark-600 cursor-not-allowed'"
              :disabled="!nextEpisode"
              @click="nextEpisode && selectEpisode(nextEpisode)"
            >
              Next
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <!-- Back to Drama Detail -->
          <NuxtLink
            :to="`/drama/${route.params.id}`"
            class="block text-center text-sm text-dark-400 hover:text-primary-400 transition-colors py-2"
          >
            Lihat Detail Drama →
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DramaDetail, Episode } from '~/types'

definePageMeta({ layout: 'watch' })

const route = useRoute()
const router = useRouter()
const api = useApi()
const { haptic } = useTelegram()
const { addToHistory, updateEpisode } = useHistory()
const { isFavorite, toggleFavorite } = useFavorites()

const drama = ref<DramaDetail | null>(null)
const episodes = ref<Episode[]>([])
const currentEpisode = ref<Episode | null>(null)
const videoUrl = ref('')
const isLoadingEpisode = ref(false)
const dataReady = ref(false)

// Lazy load — instant navigation, data fetched in background
const { data, pending } = await useLazyAsyncData(`watch-${route.params.id}`, async () => {
  const [dramaData, episodesData] = await Promise.all([
    api.getDramaDetail(route.params.id as string),
    api.getEpisodes(route.params.id as string)
  ])
  return { drama: dramaData, episodes: episodesData }
})

// Populate refs reactively from the returned data (survives SSR hydration)
watch(data, (val) => {
  if (val) {
    drama.value = val.drama
    episodes.value = val.episodes || []
    dataReady.value = true
  }
}, { immediate: true })

// Episode auto-select is set up AFTER selectEpisode is defined (below)

const isCurrentDramaFavorite = computed(() =>
  drama.value ? isFavorite(drama.value.id) : false
)

const prevEpisode = computed(() => {
  if (!currentEpisode.value) return null
  const idx = episodes.value.findIndex(e => e.id === currentEpisode.value?.id)
  return idx > 0 ? episodes.value[idx - 1] : null
})

const nextEpisode = computed(() => {
  if (!currentEpisode.value) return null
  const idx = episodes.value.findIndex(e => e.id === currentEpisode.value?.id)
  return idx < episodes.value.length - 1 ? episodes.value[idx + 1] : null
})

const qualityOptions = computed(() => {
  if (!currentEpisode.value) return []
  const ep = currentEpisode.value
  const opts = []
  if (ep.link_720_premium) opts.push({ label: '720p Premium', value: ep.link_720_premium })
  if (ep.videoUrl) opts.push({ label: '720p', value: ep.videoUrl })
  if (ep.link_480) opts.push({ label: '480p', value: ep.link_480 })
  if (ep.link_360) opts.push({ label: '360p', value: ep.link_360 })
  return opts
})

const selectEpisode = async (ep: Episode) => {
  try { haptic('light') } catch (e) {}
  isLoadingEpisode.value = true
  videoUrl.value = ''

  try {
    if (!ep.videoUrl) {
      const full = await api.getEpisode(ep.id)
      if (full) ep = { ...ep, ...full }
    }
    currentEpisode.value = ep
    videoUrl.value = ep.videoUrl || ep.link_720_premium || (ep as any).link720_premium || ep.link_480 || ep.link_360 || ''

    if (drama.value?.id) {
      updateEpisode(drama.value.id as string, ep.id, ep.episodeNumber)
    }

    // Update URL query param without reload
    router.replace({ query: { ep: ep.id } })
  } catch (err) {
    console.error('Failed to load episode:', err)
  } finally {
    isLoadingEpisode.value = false
  }
}

// Auto-select first/requested episode once data is populated
// Uses dataReady (set by the data watcher) to work on both client nav and page refresh
watch(dataReady, async (ready) => {
  if (ready && episodes.value.length > 0 && !currentEpisode.value) {
    const epId = route.query.ep as string
    const target = epId
      ? episodes.value.find(e => e.id === epId)
      : episodes.value[0]
    if (target) await selectEpisode(target)
  }
}, { immediate: true })

const onProgress = (progress: number) => {
  if (drama.value && currentEpisode.value) {
    addToHistory(drama.value, currentEpisode.value, progress)
  }
}

const onEnded = () => {
  try { haptic('medium') } catch (e) {}
  if (nextEpisode.value) selectEpisode(nextEpisode.value)
}

const onFavoriteClick = () => {
  if (drama.value) {
    toggleFavorite(drama.value)
    try { haptic('light') } catch (e) {}
  }
}

useHead(() => ({
  title: drama.value
    ? `${drama.value.title} - Episode ${currentEpisode.value?.episodeNumber ?? ''} | DramaQueen`
    : 'Loading... | DramaQueen'
}))
</script>
