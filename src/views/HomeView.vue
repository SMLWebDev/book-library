<template>
  <div>
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Your Personal Book Library</h1>
      <p class="text-xl text-gray-600">
        Track your reading, discover new books, and gain insights into your reading habits.
      </p>
    </div>

    <div v-if="authStore.user" class="bg-gray-200 p-4 rounded-lg mb-8">
      <div class="flex flex-col items-center">
        <h3 class="text-xl text-gray-700 mb-2">
          Welcome Back,
          <span class="font-bold text-indigo-600">{{ authStore.user.user_metadata.name }}</span>
        </h3>
        <p class="text-gray-700 mb-2">See a snapshot of your stats below.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <h3 class="text-2xl font-bold text-indigo-600">{{ bookStore.stats.totalBooks }}</h3>
          <p class="text-gray-600">Total Books</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <h3 class="text-2xl font-bold text-indigo-600">{{ bookStore.stats.booksRead }}</h3>
          <p class="text-gray-600">Books Read</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <h3 class="text-2xl font-bold text-indigo-600">{{ bookStore.stats.pagesRead }}</h3>
          <p class="text-gray-600">Pages Read</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-4">Quick Search</h2>
      <BookSearch />
    </div>

    <div
      v-if="!authStore.user && !authStore.isLoading"
      class="bg-white rounded-lg shadow p-6 text-center my-8"
    >
      <h2 class="text-2xl text-gray-600 font-bold mb-4">Get Started</h2>
      <p class="text-gray-600 mb-4">
        Sign in or create an account to start building your personal book library.
      </p>
      <div class="flex justify-center space-x-4">
        <RouterLink to="/login">
          <Button label="Sign In" />
        </RouterLink>
        <RouterLink to="/register">
          <Button label="Create Account" severity="secondary" />
        </RouterLink>
      </div>
    </div>

    <div v-if="authStore.isLoading" class="text-center py-8">
      <ProgressSpinner style="width: 50px; height: 50px" />
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useBookStore } from '@/stores/books'
import { useAuthStore } from '@/stores/auth'

import { Button, ProgressSpinner } from 'primevue'

import BookSearch from '@/components/BookSearch.vue'

const bookStore = useBookStore()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.user) {
    bookStore.fetchUserBooks()
  }
})
</script>
