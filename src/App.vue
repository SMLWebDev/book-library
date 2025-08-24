<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/Layout/AppLayout.vue'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initializeAuth()
})
</script>
