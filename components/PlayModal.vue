<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/80 backdrop-blur-sm"
          @click="$emit('close')"
        />
        
        <div
          class="relative w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-dark-950 sm:rounded-xl overflow-hidden flex flex-col animate-slide-up"
        >
          <div class="flex items-center justify-between p-4 border-b border-dark-800">
            <div class="flex-1 min-w-0">
              <h2 class="font-semibold text-white truncate">{{ drama?.title }}</h2>
              <p class="text-sm text-dark-400">Episode {{ currentEpisode?.episodeNumber }}</p>
            </div>
            <button
              class="p-2 rounded-lg hover:bg-dark-800 transition-colors"
              @click="$emit('close')"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="flex-shrink-0 bg-black relative aspect-video w-full">
            <div v-if="isLoadingEpisode" class="absolute inset-0 flex items-center justify-center z-10">
              <div class="relative w-12 h-12">
                <div class="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <VideoPlayer
              v-if="videoUrl"
              :key="videoUrl"
              :src="videoUrl"
              :poster="drama?.backdrop || drama?.poster"
              :qualities="qualityOptions"
              @progress="onProgress"
              @ended="onEnded"
              @next="nextEpisode && selectEpisode(nextEpisode)"
              @previous="prevEpisode && selectEpisode(prevEpisode)"
              @favorite="onFavoriteToggle"
            />
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <button
                v-for="ep in episodes"
                :key="ep.id"
                class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                :class="[
                  currentEpisode?.id === ep.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                ]"
                @click="selectEpisode(ep)"
              >
                {{ ep.episodeNumber }}
              </button>
            </div>
            
            <div class="flex items-center gap-3">
              <button
                class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors"
                :class="[
                  prevEpisode
                    ? 'bg-dark-800 text-white hover:bg-dark-700'
                    : 'bg-dark-800/50 text-dark-500 cursor-not-allowed'
                ]"
                :disabled="!prevEpisode"
                @click="prevEpisode && selectEpisode(prevEpisode)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Previous
              </button>
              
              <button
                class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors"
                :class="[
                  nextEpisode
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-dark-800/50 text-dark-500 cursor-not-allowed'
                ]"
                :disabled="!nextEpisode"
                @click="nextEpisode && selectEpisode(nextEpisode)"
              >
                Next
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            
            <NuxtLink
              :to="`/drama/${drama?.id}`"
              class="block text-center text-sm text-dark-400 hover:text-primary-400 transition-colors"
              @click="$emit('close')"
            >
              View Drama Details
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Drama, Episode } from '~/types'

const props = withDefaults(defineProps<{
  show?: boolean
  drama?: Drama | null
  episodes?: Episode[]
  episodeId?: string
}>(), {
  show: false,
  drama: null,
  episodes: () => [],
  episodeId: ''
})

const emit = defineEmits<{
  close: []
  updateProgress: [number]
}>()

const { addToHistory, updateProgress, updateEpisode } = useHistory()
const { haptic, notify } = useTelegram()
const api = useApi()

const currentEpisode = ref<Episode | null>(null)
const videoUrl = ref('')
const isLoadingEpisode = ref(false)

const qualityOptions = computed(() => {
  if (!currentEpisode.value) return []
  const options = []
  if (currentEpisode.value.link_720_premium) {
    options.push({ label: '720p Premium', value: currentEpisode.value.link_720_premium })
  }
  if (currentEpisode.value.videoUrl) {
    options.push({ label: '720p', value: currentEpisode.value.videoUrl })
  }
  if (currentEpisode.value.link_480) {
    options.push({ label: '480p', value: currentEpisode.value.link_480 })
  }
  if (currentEpisode.value.link_360) {
    options.push({ label: '360p', value: currentEpisode.value.link_360 })
  }
  return options
})

const prevEpisode = computed(() => {
  if (!currentEpisode.value) return null
  const index = props.episodes.findIndex(ep => ep.id === currentEpisode.value?.id)
  return index > 0 ? props.episodes[index - 1] : null
})

const nextEpisode = computed(() => {
  if (!currentEpisode.value) return null
  const index = props.episodes.findIndex(ep => ep.id === currentEpisode.value?.id)
  return index < props.episodes.length - 1 ? props.episodes[index + 1] : null
})

const selectEpisode = async (ep: Episode) => {
  try {
    haptic('light')
  } catch (e) {}
  
  try {
    isLoadingEpisode.value = true
    if (!ep.videoUrl) {
      videoUrl.value = ''
      const fullEp = await api.getEpisode(ep.id)
      if (fullEp) {
        ep = { ...ep, ...fullEp }
      }
    }
    
    currentEpisode.value = ep
    videoUrl.value = ep.videoUrl || ep.link_720_premium || (ep as any).link720_premium || ep.link_480 || ep.link_360 || ''
    
    if (props.drama?.id) {
      updateEpisode(props.drama.id as string, ep.id, ep.episodeNumber)
    }

    // Delay preload more to not compete with active video loading
    preloadNextEpisode()
  } catch (error) {
    console.error('Failed to load episode:', error)
  } finally {
    isLoadingEpisode.value = false
  }
}

const preloadNextEpisode = () => {
  if (!nextEpisode.value) return
  
  setTimeout(async () => {
    try {
      const nextEp = nextEpisode.value
      if (!nextEp) return;
      
      let prefetchUrl = nextEp.videoUrl;
      
      if (!prefetchUrl) {
        const fullEp = await api.getEpisode(nextEp.id)
        if (fullEp && fullEp.videoUrl) {
          prefetchUrl = fullEp.videoUrl
        }
      }
      
      if (prefetchUrl) {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = prefetchUrl
        document.head.appendChild(link)
      }
    } catch (e) {
      console.log('Preload next episode skipped')
    }
  }, 10000) // Increase delay from 2s to 10s so it doesn't steal bandwidth from initial playback
}

const onProgress = (progress: number) => {
  if (props.drama && currentEpisode.value) {
    addToHistory(props.drama, currentEpisode.value, progress)
  }
  emit('updateProgress', progress)
}

const onEnded = () => {
  haptic('medium')
  if (nextEpisode.value) {
    selectEpisode(nextEpisode.value)
  }
}

watch(() => props.episodeId, async (newId) => {
  if (newId && props.episodes.length > 0) {
    const ep = props.episodes.find(e => e.id === newId)
    if (ep) {
      await selectEpisode(ep)
    }
  }
}, { immediate: true })

const onFavoriteToggle = (isFav: boolean) => {
  // Disini kita bisa panggil API endpoint untuk favorite
  console.log('Video favorite toggled:', isFav, 'for drama:', props.drama?.title)
}

watch(() => props.show, (show) => {
  if (show) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
