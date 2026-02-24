<template>
  <div class="min-h-screen bg-white dark:bg-dark-950">
    <Navbar @open-search="showSearch = true" />
    
    <main class="pt-14 pb-16">
      <NuxtPage />
    </main>
    
    <BottomNav />
    
    <SearchModal
      :show="showSearch"
      @close="showSearch = false"
    />
  </div>
</template>

<script setup lang="ts">
const showSearch = ref(false)
</script>
