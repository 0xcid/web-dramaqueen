<template>
  <header class="fixed top-0 left-0 right-0 z-50 safe-top">
    <div class="bg-white/90 dark:bg-dark-900/90 backdrop-blur-lg border-b border-dark-200 dark:border-dark-800">
      <div class="flex items-center justify-between px-4 h-14">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span class="font-bold text-lg bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            DramaQueen
          </span>
        </NuxtLink>
        
        <div class="flex items-center gap-2">
          <button
            class="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
            @click="$emit('openSearch')"
          >
            <svg class="w-5 h-5 text-dark-600 dark:text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
          
          <button
            class="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
            @click="toggleTheme"
          >
            <svg v-if="isDark" class="w-5 h-5 text-dark-600 dark:text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <svg v-else class="w-5 h-5 text-dark-600 dark:text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { isDark, toggleTheme } = useTheme()

defineEmits<{
  openSearch: []
}>()
</script>
