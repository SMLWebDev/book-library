<template>
  <header class="bg-white shadow-sm">
    <Menubar :model="items">
      <template #start>
        <RouterLink to="/" class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-indigo-600">The One Library</span>
        </RouterLink>
      </template>
      <template #item="{ item, props }">
        <RouterLink
          v-if="item.label"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
          class="no-underline text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <a ripple :href="href" v-bind="props.action" @click="navigate">
            <span>{{ item.label }}</span>
          </a>
        </RouterLink>
      </template>
      <template #end>
        <div v-if="authStore.user" class="flex items-center space-x-3">
          <span class="text-sm text-gray-600">
            Hello, {{ authStore.user.user_metadata?.name }}
          </span>
          <Button label="Sign Out" @click="handleSignOut" severity="secondary" size="small" />
        </div>

        <div class="flex items-center space-x-2">
          <RouterLink to="/login">
            <Button label="Sign In" security="secondary" size="small" />
          </RouterLink>
          <RouterLink to="/register">
            <Button label="Sign Up" size="small" severity="secondary" />
          </RouterLink>
        </div>
      </template>
    </Menubar>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Menubar, Button } from 'primevue'

const router = useRouter()
const authStore = useAuthStore()

const items = ref([
  {
    label: 'Home',
    command: () => {
      router.push('/')
    },
  },
  {
    label: 'My Library',
    command: () => {
      router.push('/library')
    },
  },
])

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (err) {
    console.error('Error signing out: ', err)
  }
}
</script>
