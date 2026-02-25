<template>
  <div
    ref="containerRef"
    class="relative w-full aspect-video bg-black rounded-lg overflow-hidden group select-none shadow-2xl"
    :class="{ 'cursor-none': !showControls && isPlaying }"
    @mousemove="resetControls"
    @mouseleave="hideControls"
    @touchstart="resetControls"
  >
    <!-- Video Element -->
    <video
      ref="videoEl"
      class="w-full h-full cursor-pointer"
      :poster="poster"
      playsinline
      autoplay
      preload="auto"
      :class="{
        'object-contain object-center scale-110': isFullscreen && !isHorizontal,
        'object-contain': !(isFullscreen && !isHorizontal)
      }"
      @click="togglePlay"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @waiting="handleWaiting"
      @playing="handlePlaying"
      @ended="onEnded"
      @error="onError"
    />

    <!-- Loading Overlay -->
    <Transition name="fade">
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 pointer-events-none">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </Transition>

    <!-- Error Overlay -->
    <Transition name="fade">
      <div v-if="error" class="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-[60] text-center p-6">
        <div class="p-4 bg-red-500/10 rounded-full mb-4">
          <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h3 class="text-white font-bold text-lg mb-2">Video Gagal Dimuat</h3>
        <p class="text-dark-400 text-sm max-w-xs mb-6">{{ error }}</p>
        <button 
          class="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-semibold transition-all active:scale-95 shadow-lg shadow-primary-500/20"
          @click="retry"
        >
          Coba Lagi
        </button>
      </div>
    </Transition>

    <!-- Center Play/Pause Large Button (Transient) -->
    <Transition name="scale">
      <div v-if="showControls && !isLoading && !error" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <button 
          class="w-20 h-20 flex items-center justify-center bg-white/10 hover:bg-primary-500/80 backdrop-blur-md rounded-full text-white transition-all pointer-events-auto active:scale-90"
          @click="togglePlay"
        >
          <svg v-if="!isPlaying" class="w-10 h-10 translate-x-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Controls Bottom Bar -->
    <Transition name="bottom-slide">
      <div 
        v-show="showControls || !isPlaying" 
        class="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-50 flex flex-col gap-3"
        @click.stop
      >
        <!-- Progress Bar -->
        <div class="relative group/progress h-5 flex items-center cursor-pointer" @mousedown="startSeek">
          <div class="absolute inset-0 h-1.5 top-1/2 -translate-y-1/2 bg-white/20 rounded-full overflow-hidden transition-all group-hover/progress:h-2">
            <!-- Buffering Bar -->
            <div 
              class="absolute inset-0 bg-white/10"
              :style="{ width: bufferedProgress + '%' }"
            ></div>
            <!-- Progress Fill -->
            <div 
              class="absolute inset-0 bg-primary-500 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
          <!-- Seek Handle -->
          <div 
            class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform z-10"
            :style="{ left: progressPercent + '%' }"
          ></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Play/Pause -->
            <button class="text-white hover:text-primary-500 transition-colors" @click="togglePlay">
              <svg v-if="!isPlaying" class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>

            <!-- Volume -->
            <div class="flex items-center gap-2 group/volume">
              <button class="text-white hover:text-primary-500 transition-colors" @click="toggleMute">
                <svg v-if="isMuted || volume === 0" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                <svg v-else-if="volume < 0.5" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 5v14l-4.707-4.707H4a1 1 0 01-1-1v-4a1 1 0 011-1h3.293L12 5z" />
                </svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 5v14l-4.707-4.707H4a1 1 0 01-1-1v-4a1 1 0 011-1h3.293L12 5z" />
                </svg>
              </button>
              <div class="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300 flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  v-model.number="volume" 
                  class="w-20 h-1 bg-white/30 rounded-full accent-primary-500 cursor-pointer"
                />
              </div>
            </div>

            <!-- Time Display -->
            <span class="text-white text-xs font-medium font-mono">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <!-- Quality Selector -->
            <div v-if="qualityOptions.length > 0" class="relative" ref="menuRef">
              <button 
                class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-white transition-colors flex items-center gap-1"
                @click="showQualityMenu = !showQualityMenu"
              >
                {{ currentQualityLabel }}
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <Transition name="fade">
                <div v-if="showQualityMenu" class="absolute bottom-full right-0 mb-3 bg-dark-900 border border-dark-800 rounded-lg overflow-hidden shadow-xl min-w-[120px]">
                  <button
                    v-for="opt in qualityOptions"
                    :key="opt.value"
                    class="block w-full text-left px-4 py-2.5 text-xs transition-colors"
                    :class="[
                      src === opt.value 
                        ? 'bg-primary-500 text-white' 
                        : 'text-dark-200 hover:bg-dark-800'
                    ]"
                    @click="selectQuality(opt)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Fullscreen -->
            <button class="text-white hover:text-primary-500 transition-colors" @click="toggleFullscreen">
              <svg v-if="!isFullscreen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m0 0v2m0-2H7m2 0h2M9 21v-2m0 0v-2m0 2H7m2 0h2M21 9h-2m0 0h-2m2 0V7m0 2v2M3 9h2m0 0h2m-2 0V7m0 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Hls from 'hls.js'

const props = defineProps<{
  src: string
  poster?: string
  qualities?: {
    label: string
    value: string
  }[]
}>()

const emit = defineEmits<{
  progress: [number]
  ended: []
  loaded: []
  error: [string]
}>()

// Refs
const videoEl = ref<HTMLVideoElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const hlsInstance = ref<Hls | null>(null)

// State
const isPlaying = ref(false)
const isLoading = ref(true)
const isMuted = ref(false)
const isFullscreen = ref(false)
const isHorizontal = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const error = ref('')
const showControls = ref(true)
const showQualityMenu = ref(false)
let controlsTimeout: any = null

// Computed
const progressPercent = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const bufferedProgress = ref(0)

const currentQualityLabel = computed(() => {
  const opt = props.qualities?.find(q => q.value === props.src)
  return opt?.label || 'Auto'
})

const qualityOptions = computed(() => props.qualities || [])

// Initialization & HLS
const initPlayer = () => {
  const video = videoEl.value
  if (!video) return

  const isM3U8 = props.src.includes('.m3u8')
  const isProxiedM3U8 = props.src.includes('video-proxy') && props.src.includes('%2Em3u8')
  const isHls = isM3U8 || isProxiedM3U8

  if (hlsInstance.value) {
    hlsInstance.value.destroy()
    hlsInstance.value = null
  }

  if (isHls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 5,        // Buffer 5 detik saja untuk startup cepat (dinaikkan dikit dari 3 biar gak buffer berulang)
      maxMaxBufferLength: 10,     // Max buffer 10 detik
      maxBufferHole: 1,          // Toleransi gap lebih tinggi
      maxBufferSize: 15 * 1000 * 1000,  // 15MB max
      startFragPrefetch: true,   
      startLevel: -1,            // Auto-detect level terbaik
      abrEwmaDefaultEstimate: 500000, // Asumsi awal 500kbps (konservatif)
      abrBandWidthUpFactor: 0.7, // Naikkan kualitas lebih lambat
      fragLoadingMaxRetry: 3,
      manifestLoadingMaxRetry: 3,
      manifestLoadingMaxRetryTimeout: 5000,
      fragLoadingMaxRetryTimeout: 5000,
      fragLoadingTimeOut: 15000,    // Timeout lebih lama (proxy = slower)
      manifestLoadingTimeOut: 15000, // Timeout lebih lama
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 5,
      backBufferLength: 10,
      nudgeMaxRetry: 3
    })
    hls.loadSource(props.src)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {
        isPlaying.value = false
      })
    })

    // Listen to buffering events to toggle loading state
    hls.on(Hls.Events.FRAG_LOADING, () => {
      // Don't blindly show loading, wait for FRAG_BUFFERED or Stalled
    })
    
    hls.on(Hls.Events.FRAG_BUFFERED, () => {
        isLoading.value = false;
        error.value = ''
    })

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError()
            break
          default:
            error.value = 'Fatal player error. Please retry.'
            hls.destroy()
            break
        }
      }
    })
    hlsInstance.value = hls
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari & Mobile support
    video.src = props.src
    video.play().catch(() => {})
  } else {
    // Normal MP4, etc
    video.src = props.src
    video.play().catch(() => {})
  }
}

// Controls
const togglePlay = () => {
  if (!videoEl.value) return
  if (isPlaying.value) {
    videoEl.value.pause()
  } else {
    videoEl.value.play()
  }
}

const toggleMute = () => {
  if (!videoEl.value) return
  isMuted.value = !isMuted.value
  videoEl.value.muted = isMuted.value
}

const toggleFullscreen = () => {
  if (!containerRef.value) return
  if (!document.fullscreenElement) {
    containerRef.value.requestFullscreen().then(() => {
      if (isHorizontal.value && screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('landscape').catch(() => {})
      }
    }).catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`)
    })
  } else {
    if (screen.orientation && 'unlock' in screen.orientation) {
      screen.orientation.unlock()
    }
    document.exitFullscreen()
  }
}

const handleTimeUpdate = () => {
  if (videoEl.value) {
    currentTime.value = videoEl.value.currentTime
    const buffered = videoEl.value.buffered
    if (buffered.length > 0) {
      bufferedProgress.value = (buffered.end(buffered.length - 1) / duration.value) * 100
    }
  }
}

const handleLoadedMetadata = () => {
  if (videoEl.value) {
    duration.value = videoEl.value.duration
    isHorizontal.value = videoEl.value.videoWidth > videoEl.value.videoHeight
    isLoading.value = false
    emit('loaded')
  }
}

const selectQuality = (opt: { label: string; value: string }) => {
  showQualityMenu.value = false
  if (opt.value !== props.src) {
    error.value = ''
    isLoading.value = true
    // In Nuxt, we let the parent handle src change via props
  }
}

const retry = () => {
  error.value = ''
  isLoading.value = true
  initPlayer()
}

const resetControls = () => {
  showControls.value = true
  clearTimeout(controlsTimeout)
  if (isPlaying.value) {
    controlsTimeout = setTimeout(() => {
      showControls.value = false
    }, 3000)
  }
}

const hideControls = () => {
  if (isPlaying.value) {
    showControls.value = false
  }
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Seek functionality
let isSeeking = false
const startSeek = (e: MouseEvent) => {
  isSeeking = true
  updateSeek(e)
  document.addEventListener('mousemove', updateSeek)
  document.addEventListener('mouseup', stopSeek)
}

const updateSeek = (e: MouseEvent) => {
  if (!isSeeking || !videoEl.value || !containerRef.value) return
  const progressContainer = (e.currentTarget as HTMLElement).closest('.group/progress') || (e.target as HTMLElement).closest('.group/progress')
  if (!progressContainer) return
  
  const rect = progressContainer.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  const percent = x / rect.width
  videoEl.value.currentTime = percent * duration.value
  currentTime.value = videoEl.value.currentTime
}

const stopSeek = () => {
  isSeeking = false
  document.removeEventListener('mousemove', updateSeek)
  document.removeEventListener('mouseup', stopSeek)
}

// Keyboard Listeners
const handleKeydown = (e: KeyboardEvent) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

  switch (e.key.toLowerCase()) {
    case ' ':
    case 'k':
      e.preventDefault()
      togglePlay()
      break
    case 'f':
      e.preventDefault()
      toggleFullscreen()
      break
    case 'm':
      e.preventDefault()
      toggleMute()
      break
    case 'arrowleft':
      e.preventDefault()
      if (videoEl.value) videoEl.value.currentTime -= 10
      break
    case 'arrowright':
      e.preventDefault()
      if (videoEl.value) videoEl.value.currentTime += 10
      break
  }
  resetControls()
}

// Stalled Recovery
let stallTimeout: any = null
const checkStalled = () => {
    if(!videoEl.value) return;
    
    // If not paused, and waiting for data for > 15 seconds
    if (!videoEl.value.paused && isLoading.value) {
        error.value = 'Koneksi melambat atau terputus. Silakan coba lagi.'
        if(hlsInstance.value) {
          hlsInstance.value.stopLoad()
        }
    }
}

const onEnded = () => {
    emit('ended')
}

const onPlay = () => {
    isPlaying.value = true
    resetControls()
}

const onPause = () => {
    isPlaying.value = false
}

const onError = (e: Event) => {
    emit('error', 'Play error occured')
}

const handleWaiting = () => {
    isLoading.value = true
    error.value = ''
    clearTimeout(stallTimeout)
    stallTimeout = setTimeout(checkStalled, 15000)
}

const handlePlaying = () => {
    isLoading.value = false
    clearTimeout(stallTimeout)
}

// Lifecycle
onMounted(() => {
  initPlayer()
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
    // Unlock orientation if exiting via hardware back or ESC
    if (!document.fullscreenElement && screen.orientation && 'unlock' in screen.orientation) {
      screen.orientation.unlock()
    }
  })

  // Watch volume
  watch(volume, (v) => {
    if (videoEl.value) {
      videoEl.value.volume = v
      isMuted.value = v === 0
    }
  }, { immediate: true })
})

onUnmounted(() => {
  if (hlsInstance.value) hlsInstance.value.destroy()
  window.removeEventListener('keydown', handleKeydown)
  clearTimeout(controlsTimeout)
  clearTimeout(stallTimeout)
})

watch(() => props.src, () => {
  error.value = ''
  isLoading.value = true
  initPlayer()
})

defineExpose({
  play: () => videoEl.value?.play(),
  pause: () => videoEl.value?.pause(),
  seek: (t: number) => { if (videoEl.value) videoEl.value.currentTime = t },
  currentTime
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.bottom-slide-enter-active,
.bottom-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.bottom-slide-enter-from,
.bottom-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.8);
  opacity: 0;
}

/* Custom Seek Range */
input[type="range"] {
  -webkit-appearance: none;
  background: transparent;
}
input[type="range"]:focus {
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  margin-top: -4px;
}
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}
</style>
