<template>
  <div class="relative" ref="searchContainer">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="w-full pl-10 pr-10 py-3 bg-dark-100 dark:bg-dark-800 rounded-xl text-dark-900 dark:text-white placeholder-dark-500 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        @input="onInput"
        @keyup.enter="onSearch"
      />
      
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 dark:text-dark-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      
      <button
        v-if="searchQuery"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
        @click="clear"
      >
        <svg class="w-4 h-4 text-dark-500 dark:text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <div
      v-if="showResults && results.length > 0"
      class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-900 rounded-xl shadow-xl border border-dark-200 dark:border-dark-700 max-h-[60vh] overflow-y-auto z-50"
    >
      <NuxtLink
        v-for="drama in results"
        :key="drama.id"
        :to="`/drama/${drama.id}`"
        class="flex items-center gap-3 p-3 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
        @click="onResultClick(drama)"
      >
        <img
          :src="drama.poster"
          :alt="drama.title"
          class="w-12 h-16 object-cover rounded"
        />
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-dark-900 dark:text-white truncate">{{ drama.title }}</h4>
          <div class="flex items-center gap-2 text-xs text-dark-500 dark:text-dark-400">
            <span v-if="drama.year">{{ drama.year }}</span>
            <span v-if="drama.status" class="px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-500">
              {{ drama.status }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
    
    <div
      v-if="showResults && searchQuery && results.length === 0 && !loading"
      class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-900 rounded-xl shadow-xl border border-dark-200 dark:border-dark-700 p-4 text-center text-dark-500 dark:text-dark-400 z-50"
    >
      No results found for "{{ searchQuery }}"
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Drama } from '~/types'

const props = defineProps<{
  placeholder?: string
}>()

const emit = defineEmits<{
  search: [string]
  select: [Drama]
}>()

const api = useApi()

const searchQuery = ref('')
const results = ref<Drama[]>([])
const loading = ref(false)
const showResults = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const onInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  if (!searchQuery.value.trim()) {
    results.value = []
    showResults.value = false
    return
  }
  
  debounceTimer = setTimeout(async () => {
    await doSearch()
  }, 300)
}

const doSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  showResults.value = true
  
  try {
    results.value = await api.searchDrama(searchQuery.value.trim())
  } catch (error) {
    console.error('Search failed:', error)
    results.value = []
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
    showResults.value = false
  }
}

const onResultClick = (drama: Drama) => {
  emit('select', drama)
  showResults.value = false
  searchQuery.value = ''
  results.value = []
}

const clear = () => {
  searchQuery.value = ''
  results.value = []
  showResults.value = false
}

const searchContainer = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (showResults.value && searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    showResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>
