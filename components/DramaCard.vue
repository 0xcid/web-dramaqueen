<template>
  <div
    class="relative group cursor-pointer rounded-xl overflow-hidden bg-dark-800 shadow-md transition-all hover:ring-2 hover:ring-primary-500 hover:shadow-lg"
    @click="$emit('click')"
  >
    <div class="aspect-[2/3] relative">
      <img
        :src="drama.poster"
        :alt="drama.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="(e: Event) => { const t = e.target as HTMLImageElement; t.style.opacity = '0' }"
      />
      
      <!-- Top Badges -->
      <div v-if="drama.status === 'Ongoing'" class="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm text-white text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-md font-bold uppercase tracking-wide z-10 shadow-sm">
        Ongoing
      </div>
      <div v-if="drama.rating" class="absolute top-2 left-2 bg-primary-500/90 backdrop-blur-sm text-white text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-md font-bold z-10 shadow-sm">
        {{ drama.rating }}
      </div>

      <!-- Play Overlay -->
      <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div class="bg-primary-500 text-white p-3 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      <!-- Progress Bar if History exists -->
      <div v-if="historyItem" class="absolute bottom-0 left-0 right-0 h-1 bg-dark-900/60 z-20">
        <div
          class="h-full bg-primary-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"
          :style="{ width: `${historyItem.progress}%` }"
        />
      </div>
    </div>
    
    <!-- Info Section (Title and Year below poster) -->
    <div class="p-3 bg-dark-800 relative z-20 min-h-[4rem] sm:min-h-[4.5rem] flex flex-col justify-end">
      <!-- Gradient overlay to blend bottom part of the poster slightly -->
      <div class="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-dark-800 to-transparent pointer-events-none" />
      
      <h3 class="font-bold text-[13px] sm:text-sm leading-tight line-clamp-2 text-white group-hover:text-primary-400 transition-colors">
        {{ drama.title }}
      </h3>
      <div class="flex items-center gap-2 mt-1 text-[11px] sm:text-xs text-dark-400 font-medium">
        <span v-if="drama.year">{{ drama.year }}</span>
        <span v-if="drama.episodeCount && !drama.year">{{ drama.episodeCount }} Episodes</span>
        <span v-if="historyItem" class="text-primary-400"> • Ep {{ historyItem.episodeNumber }}</span>
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
