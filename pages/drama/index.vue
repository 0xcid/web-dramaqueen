<template>
  <div class="px-4 space-y-4 pt-4 pb-20">
    <h1 class="text-xl font-bold text-white mb-2">All Drama</h1>
    
    <div v-if="pending" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      <div v-for="i in 12" :key="i" class="space-y-2">
        <div class="skeleton aspect-[2/3] rounded-lg" />
        <div class="skeleton h-4 w-full" />
        <div class="skeleton h-3 w-2/3" />
      </div>
    </div>
    
    <template v-else>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        <DramaCard
          v-for="drama in dramas"
          :key="drama.id"
          :drama="drama"
          @click="playDrama(drama)"
        />
      </div>
      
      <div class="flex justify-center py-4">
        <button
          v-if="hasMore"
          class="btn-secondary text-sm"
          :disabled="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Drama } from '~/types'

const api = useApi()
const { haptic } = useTelegram()

const dramas = ref<Drama[]>([])
const page = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)

const { data, pending } = await useLazyAsyncData('drama-list', () => api.getDramaList(1, 24))

watch(data, (newVal) => {
  if (newVal) {
    dramas.value = [...newVal]
    hasMore.value = newVal.length >= 24
  }
}, { immediate: true })

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  page.value++
  try {
    const newData = await api.getDramaList(page.value, 24)
    if (newData.length < 24) hasMore.value = false
    dramas.value.push(...newData)
  } catch (error) {
    console.error('Failed to load more:', error)
    page.value--
  } finally {
    loadingMore.value = false
  }
}

const playDrama = (drama: Drama) => {
  try { haptic('light') } catch (e) {}
  navigateTo(`/watch/${drama.id}`)
}
</script>
