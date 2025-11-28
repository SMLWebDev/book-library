<template>
  <div>
    <!-- Navbar -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Mobile: Hamburger Menu (Left) -->
          <div class="md:hidden">
            <Button
              :icon="isMenuOpen ? 'pi pi-times' : 'pi pi-bars'"
              class="lg:hidden p-button-text"
              @click="toggleMenu"
            />
          </div>

          <div class="absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0">
            <a href="#" class="text-xl font-bold text-indigo-600 whitespace-nowrap">
              The One Library
            </a>
          </div>

          <!-- Desktop Menu Items -->
          <div class="hidden md:flex md:items-center md:gap-1 flex-1 ml-8">
            <RouterLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              class="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <i :class="item.icon"></i>
              {{ item.name }}
            </RouterLink>
          </div>

          <!-- Desktop Login/User Section -->
          <div class="hidden md:flex md:items-center md:gap-3">
            <template v-if="authStore.user">
              <span class="text-gray-700">Hello, {{ authStore.user.user_metadata?.name }}</span>
              <Avatar
                :label="authStore.user.user_metadata?.name?.charAt(0)"
                class="bg-indigo-600 text-white"
                shape="circle"
              />
              <Button
                label="Sign Out"
                class="p-button-text text-gray-600 hover:text-gray-800"
                @click="handleSignOut"
              />
            </template>
            <template v-else>
              <RouterLink to="/login">
                <Button
                  icon="pi pi-sign-in"
                  class="bg-indigo-600 hover:bg-indigo-700"
                  @click="toggleLogin"
                />
              </RouterLink>
            </template>
          </div>

          <!-- Mobile: Spacer -->
          <div class="w-10 md:hidden"></div>
        </div>

        <!-- Mobile Menu Dropdown -->
        <div v-if="isMenuOpen" class="md:hidden border-t border-gray-200 py-2">
          <RouterLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <i :class="item.icon"></i>
            {{ item.name }}
          </RouterLink>

          <Divider class="my-2" />

          <template v-if="authStore.user">
            <div class="flex items-center gap-3 px-4 py-3 text-gray-700">
              <Avatar
                :label="authStore.user.user_metadata?.name?.charAt(0)"
                class="bg-indigo-600 text-white"
                shape="circle"
                size="normal"
              />
              <span>Hello, {{ authStore.user.user_metadata?.name }}</span>
            </div>
            <button
              class="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              @click="handleMobileLogout"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <a
              href="#"
              class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              @click="handleMobileLogin"
            >
              <i class="pi pi-sign-in"></i>
              Login
            </a>
          </template>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import { Button, Avatar, Divider } from 'primevue'

const router = useRouter()
const authStore = useAuthStore()

const isMenuOpen = ref(false)
const isLoggedIn = ref(false)

const navigation = ref([
  { name: 'Home', to: '/', icon: 'pi pi-home' },
  { name: 'Library', to: '/library', icon: 'pi pi-book' },
])

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleLogin = () => {
  isLoggedIn.value = !isLoggedIn.value
}

const handleMobileLogin = () => {
  toggleLogin()
  closeMenu()
}

const handleMobileLogout = () => {
  toggleLogin()
  closeMenu()
}

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error('Error Signing Out: ', error)
  }
}
</script>
