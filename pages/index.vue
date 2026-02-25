<template>
  <div class="space-y-6 pb-20">
    <section v-if="continueWatching.length > 0" class="px-4 pt-4">
      <h2 class="text-xl font-bold text-white mb-4">Continue Watching</h2>
      <div class="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div class="flex gap-3">
          <div
            v-for="item in continueWatching"
            :key="item.dramaId"
            class="flex-shrink-0 w-32 cursor-pointer"
            @click="playDrama(item.drama, item.episodeId)"
          >
            <div class="relative rounded-lg overflow-hidden">
              <img
                :src="item.drama.poster"
                :alt="item.drama.title"
                class="poster w-full aspect-[2/3] object-cover"
                loading="lazy"
              />
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-dark-500/50">
                <div
                  class="h-full bg-primary-500"
                  :style="{ width: `${item.progress}%` }"
                />
              </div>
              <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                <div class="bg-primary-500/90 p-2 rounded-full">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            <h3 class="mt-2 text-[13px] font-semibold text-white line-clamp-1">{{ item.drama.title }}</h3>
            <p class="text-[11px] text-primary-400 font-medium">Episode {{ item.episodeNumber }}</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="px-4 mt-2">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-white">Popular</h2>
        <NuxtLink to="/drama" class="text-sm font-semibold text-primary-500 hover:text-primary-400 transition-colors">See All</NuxtLink>
      </div>

      <!-- Skeleton Loading for Popular -->
      <div v-if="pending" class="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div class="flex gap-3">
          <div v-for="i in 6" :key="i" class="flex-shrink-0 w-32 space-y-2">
            <div class="skeleton aspect-[2/3] rounded-lg" />
            <div class="skeleton h-4 w-full" />
            <div class="skeleton h-3 w-2/3" />
          </div>
        </div>
      </div>

      <!-- Actual Content -->
      <div v-else-if="popular.length > 0" class="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div class="flex gap-3">
          <div
            v-for="drama in popular"
            :key="drama.id"
            class="flex-shrink-0 w-32"
          >
            <DramaCard :drama="drama" @click="playDrama(drama)" />
          </div>
        </div>
      </div>
    </section>
    
    <section class="px-4 mt-2">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-white">Latest Updates</h2>
        <NuxtLink to="/drama" class="text-sm font-semibold text-primary-500 hover:text-primary-400 transition-colors">See All</NuxtLink>
      </div>

      <!-- Skeleton Loading for Latest -->
      <div v-if="pending" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        <div v-for="i in 12" :key="i" class="space-y-2">
          <div class="skeleton aspect-[2/3] rounded-lg" />
          <div class="skeleton h-4 w-full" />
          <div class="skeleton h-3 w-2/3" />
        </div>
      </div>

      <!-- Actual Content -->
      <div v-else-if="latest.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        <DramaCard
          v-for="drama in latest"
          :key="drama.id"
          :drama="drama"
          @click="playDrama(drama)"
        />
      </div>
    </section>
    
  </div>
</template>

<script setup lang="ts">
import type { Drama } from '~/types'

const { continueWatching } = useHistory()
const { haptic } = useTelegram()
const api = useApi()

const { data: homeData, pending } = await useLazyAsyncData('home', () => api.getHome())

const popular = computed(() => homeData.value?.popular || [])
const latest = computed(() => homeData.value?.latest || [])

const playDrama = (drama: Drama, episodeId?: string) => {
  try { haptic('light') } catch (e) {}
  const query = episodeId ? `?ep=${episodeId}` : ''
  navigateTo(`/watch/${drama.id}${query}`)
}
</script>
