<template>
  <div class="space-y-6">
    <section v-if="continueWatching.length > 0" class="px-4">
      <h2 class="text-lg font-semibold text-dark-900 dark:text-white mb-3">Continue Watching</h2>
      <div class="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div class="flex gap-3">
          <div
            v-for="item in continueWatching"
            :key="item.dramaId"
            class="flex-shrink-0 w-32 cursor-pointer"
            @click="playDrama(item.drama, item.episodeId)"
          >
            <div class="relative rounded-lg overflow-hidden">
              <img
                :src="item.drama.poster"
                :alt="item.drama.title"
                class="poster w-full"
                loading="lazy"
              />
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-dark-500/50">
                <div
                  class="h-full bg-primary-500"
                  :style="{ width: `${item.progress}%` }"
                />
              </div>
              <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                <div class="bg-primary-500/90 p-2 rounded-full">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            <h3 class="mt-2 text-xs font-medium text-dark-900 dark:text-white line-clamp-1">{{ item.drama.title }}</h3>
            <p class="text-xs text-dark-500 dark:text-dark-400">Episode {{ item.episodeNumber }}</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="px-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-dark-900 dark:text-white">Popular</h2>
        <NuxtLink to="/drama" class="text-sm text-primary-500">See All</NuxtLink>
      </div>
      <div class="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div class="flex gap-3">
          <div
            v-for="drama in popular"
            :key="drama.id"
            class="flex-shrink-0 w-32"
          >
            <DramaCard :drama="drama" @click="playDrama(drama)" />
          </div>
        </div>
      </div>
    </section>
    
    <section class="px-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-dark-900 dark:text-white">Latest Updates</h2>
        <NuxtLink to="/drama" class="text-sm text-primary-500">See All</NuxtLink>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        <DramaCard
          v-for="drama in latest"
          :key="drama.id"
          :drama="drama"
          @click="playDrama(drama)"
        />
      </div>
    </section>
    
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
const { continueWatching } = useHistory()
const { haptic } = useTelegram()

const { data: homeData } = await useAsyncData('home', () => api.getHome())

const popular = computed(() => homeData.value?.popular || [])
const latest = computed(() => homeData.value?.latest || [])

const playDrama = async (drama: Drama, episodeId?: string) => {
  try {
    haptic('light')
  } catch (e) {}
  
  selectedDrama.value = drama
  selectedEpisodeId.value = episodeId || ''
  
  try {
    const episodes = await api.getEpisodes(drama.id)
    
    if (!episodes || episodes.length === 0) {
      const { showAlert } = useTelegram()
      showAlert('Maaf, episode drama ini belum tersedia.')
      return
    }
    
    selectedEpisodes.value = episodes
    
    if (!episodeId && selectedEpisodes.value.length > 0) {
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
