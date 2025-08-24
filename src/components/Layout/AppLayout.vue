<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <RouterLink to="/" class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-indigo-600">BookLibrary</span>
          </RouterLink>

          <nav class="flex items-center space-x-4">
            <RouterLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              class="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              {{ item.name }}
            </RouterLink>

            <div v-if="authStore.user" class="flex items-center space-x-3">
              <span class="text-sm text-gray-600">Hello, {{ authStore.user.email }}</span>
              <Button label="Sign Out" @click="handleSignOut" severity="secondary" size="small" />
            </div>

            <div class="flex-items-center space-x-2">
              <RouterLink to="/login">
                <Button label="Sign In" security="secondary" size="small" />
              </RouterLink>
              <RouterLink to="/register">
                <Button label="Sign Up" size="small" severity="secondary" />
              </RouterLink>
            </div>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'

const router = useRouter()
const authStore = useAuthStore()

const navigation = ref([
  { name: 'Home', to: '/' },
  { name: 'My Library', to: '/library' },
  { name: 'Statistics', to: '/stats' },
])

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error('Error signing out: ', error)
  }
}
</script>
