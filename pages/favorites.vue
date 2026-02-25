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
        :drama="(item.drama as any)"
        @click="playDrama(item.drama)"
      />
    </div>
    
  </div>
</template>

<script setup lang="ts">
const { favorites } = useFavorites()
const { haptic } = useTelegram()

const playDrama = (drama: any) => {
  try { haptic('light') } catch (e) {}
  navigateTo(`/watch/${drama.id}`)
}

useHead(() => ({ title: 'Favorites' }))
</script>
