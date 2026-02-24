<template>
  <div class="episode-list">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-lg text-dark-900 dark:text-white">
        Episodes ({{ episodes.length }})
      </h3>
      <button
        v-if="currentEpisode"
        class="text-xs text-primary-500"
        @click="$emit('scrollToCurrent')"
      >
        Current Episode
      </button>
    </div>
    
    <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
      <button
        v-for="ep in episodes"
        :key="ep.id"
        class="relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all"
        :class="[
          currentEpisodeId === ep.id
            ? 'bg-primary-500 text-white'
            : isWatched(ep.episodeNumber)
              ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
              : 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
        ]"
        @click="$emit('select', ep)"
      >
        {{ ep.episodeNumber }}
        
        <div
          v-if="isWatched(ep.episodeNumber) && currentEpisodeId !== ep.id"
          class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center"
        >
          <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Episode } from '~/types'

const props = defineProps<{
  episodes: Episode[]
  currentEpisodeId?: string
  watchedEpisodes?: number[]
}>()

defineEmits<{
  select: [Episode]
  scrollToCurrent: []
}>()

const isWatched = (episodeNumber: number) => {
  return props.watchedEpisodes?.includes(episodeNumber) ?? false
}
</script>
