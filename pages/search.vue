<template>
  <div class="px-4 space-y-4">
    <h1 class="text-xl font-bold text-dark-900 dark:text-white">Search Drama</h1>
    
    <SearchBar
      placeholder="Search by title..."
      @search="onSearch"
      @select="onSelect"
    />
    
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
    </div>
    
    <template v-else-if="searchResults.length > 0">
      <div class="text-sm text-dark-500 dark:text-dark-400">
        Found {{ searchResults.length }} results for "{{ searchQuery }}"
      </div>
      
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        <DramaCard
          v-for="drama in searchResults"
          :key="drama.id"
          :drama="drama"
          @click="playDrama(drama)"
        />
      </div>
    </template>
    
    <div v-else-if="searchQuery" class="flex flex-col items-center justify-center py-12 text-dark-500 dark:text-dark-400">
      <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p>No results found for "{{ searchQuery }}"</p>
    </div>
    
    <div v-else class="flex flex-col items-center justify-center py-12 text-dark-500 dark:text-dark-400">
      <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <p>Search for your favorite drama</p>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import type { Drama, Episode } from '~/types'

const route = useRoute()
const router = useRouter()
const api = useApi()
const { haptic } = useTelegram()

const searchQuery = ref('')
const searchResults = ref<Drama[]>([])
const loading = ref(false)

const showPlayer = ref(false)
const selectedDrama = ref<Drama | null>(null)
const selectedEpisodes = ref<Episode[]>([])
const selectedEpisodeId = ref('')

const onSearch = async (query: string) => {
  searchQuery.value = query
  loading.value = true
  
  router.push({ query: { q: query } })
  
  try {
    searchResults.value = await api.searchDrama(query)
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const onSelect = (drama: Drama) => {
  router.push(`/drama/${drama.id}`)
}

const playDrama = (drama: Drama) => {
  try { haptic('light') } catch (e) {}
  navigateTo(`/watch/${drama.id}`)
}

onMounted(() => {
  const q = route.query.q as string
  if (q) {
    onSearch(q)
  }
})

useHead(() => ({
  title: searchQuery.value ? `Search: ${searchQuery.value}` : 'Search'
}))
</script>
