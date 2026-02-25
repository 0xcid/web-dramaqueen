<template>
  <div class="px-4 space-y-4">
    <div class="flex items-center justify-between">
    <h1 class="text-xl font-bold text-white">History</h1>
      <button
        v-if="history.length > 0"
        class="text-sm text-red-500 hover:text-red-600"
        @click="clearAll"
      >
        Clear All
      </button>
    </div>
    
    <div v-if="history.length === 0" class="flex flex-col items-center justify-center py-12 text-dark-500 dark:text-dark-400">
      <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p>No watch history</p>
      <p class="text-sm mt-1">Start watching to see your history here</p>
    </div>
    
    <div v-else class="space-y-3">
      <div
        v-for="item in history"
        :key="item.dramaId"
        class="flex gap-3 bg-dark-100 dark:bg-dark-900 rounded-xl p-3 cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-800 transition-colors"
        @click="playDrama(item.drama, item.episodeId)"
      >
        <img
          :src="item.drama.poster"
          :alt="item.drama.title"
          class="w-20 h-28 object-cover rounded-lg flex-shrink-0"
        />
        <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <h3 class="font-medium text-dark-900 dark:text-white line-clamp-2">{{ item.drama.title }}</h3>
            <p class="text-sm text-dark-500 dark:text-dark-400 mt-1">Episode {{ item.episodeNumber }}</p>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-dark-400 dark:text-dark-500">
              {{ formatDate(item.lastWatched) }}
            </span>
            <div class="flex items-center gap-1 text-xs text-primary-500">
              <span>{{ Math.round(item.progress) }}%</span>
              <div class="w-16 h-1 bg-dark-300 dark:bg-dark-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-500 transition-all"
                  :style="{ width: `${item.progress}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
const { history, clearHistory } = useHistory()
const { haptic, showConfirm } = useTelegram()

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const playDrama = (drama: any, episodeId: string) => {
  try { haptic('light') } catch (e) {}
  navigateTo(`/watch/${drama.id}?ep=${episodeId}`)
}

const clearAll = async () => {
  const confirmed = await showConfirm('Clear all watch history?')
  if (confirmed) {
    clearHistory()
    haptic('medium')
  }
}

useHead(() => ({ title: 'History' }))
</script>
