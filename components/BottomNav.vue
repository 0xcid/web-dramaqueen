<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
    <div class="bg-white/95 dark:bg-dark-900/95 backdrop-blur-lg border-t border-dark-200 dark:border-dark-800">
      <div class="flex items-center justify-around h-16">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center py-2 px-4 transition-colors"
          :class="isActive(item.to) ? 'text-primary-500' : 'text-dark-500 dark:text-dark-400'"
        >
          <component :is="item.icon" class="w-6 h-6" />
          <span class="text-xs mt-1 font-medium">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const items = [
  {
    to: '/',
    label: 'Home',
    icon: defineComponent({
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>`
    })
  },
  {
    to: '/drama',
    label: 'Drama',
    icon: defineComponent({
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
      </svg>`
    })
  },
  {
    to: '/favorites',
    label: 'Favorites',
    icon: defineComponent({
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>`
    })
  },
  {
    to: '/history',
    label: 'History',
    icon: defineComponent({
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`
    })
  }
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
