<template>
  <div
    class="card cursor-pointer group"
    @click="$emit('click')"
  >
    <div class="relative overflow-hidden">
      <img
        :src="drama.poster"
        :alt="drama.title"
        class="poster w-full transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div v-if="drama.rating" class="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-md font-medium">
        {{ drama.rating }}
      </div>
      
      <div v-if="drama.status === 'Ongoing'" class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium">
        Ongoing
      </div>
      
      <div v-if="historyItem" class="absolute bottom-0 left-0 right-0 h-1 bg-dark-500/50">
        <div
          class="h-full bg-primary-500 transition-all"
          :style="{ width: `${historyItem.progress}%` }"
        />
      </div>
      
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="bg-primary-500/90 p-3 rounded-full">
          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </div>
    
    <div class="p-3">
      <h3 class="font-semibold text-sm line-clamp-2 text-dark-900 dark:text-white">
        {{ drama.title }}
      </h3>
      <div class="flex items-center gap-2 mt-1 text-xs text-dark-500 dark:text-dark-400">
        <span v-if="drama.year">{{ drama.year }}</span>
        <span v-if="drama.episodeCount">{{ drama.episodeCount }} Episodes</span>
      </div>
      <div v-if="historyItem" class="mt-1 text-xs text-primary-500">
        Episode {{ historyItem.episodeNumber }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Drama, HistoryItem } from '~/types'

defineProps<{
  drama: Drama
  historyItem?: HistoryItem | null
}>()

defineEmits<{
  click: []
}>()
</script>
