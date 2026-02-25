<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[90] bg-white dark:bg-dark-950"
      >
        <div class="safe-top safe-bottom h-full flex flex-col">
          <div class="flex items-center gap-3 p-4 border-b border-dark-200 dark:border-dark-800">
            <SearchBar
              ref="searchBarRef"
              placeholder="Search drama..."
              class="flex-1"
              @search="onSearch"
              @select="onSelect"
            />
            <button
              class="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              @click="$emit('close')"
            >
              <svg class="w-6 h-6 text-dark-600 dark:text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="loading" class="flex items-center justify-center py-12">
              <div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
            
            <div v-else-if="searchResults.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <DramaCard
                v-for="drama in searchResults"
                :key="drama.id"
                :drama="drama"
                @click="onSelect(drama)"
              />
            </div>
            
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
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Drama } from '~/types'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const api = useApi()

const searchBarRef = ref()
const searchQuery = ref('')
const searchResults = ref<Drama[]>([])
const loading = ref(false)

const onSearch = async (query: string) => {
  searchQuery.value = query
  loading.value = true
  
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
  emit('close')
  router.push(`/watch/${drama.id}`)
}

watch(() => props.show, (show) => {
  if (show) {
    nextTick(() => {
      searchBarRef.value?.$el?.querySelector('input')?.focus()
    })
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.search-modal-enter-active,
.search-modal-leave-active {
  transition: transform 0.3s ease;
}

.search-modal-enter-from,
.search-modal-leave-to {
  transform: translateY(100%);
}
</style>
