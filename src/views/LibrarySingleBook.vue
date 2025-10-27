<template>
  <div v-if="loading" class="text-center py-12">
    <ProgressSpinner />
    <p class="mt-4 text-gray-600">Loading book details...</p>
  </div>

  <div v-else-if="error" class="text-center py-12">
    <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
    <h2 class="text-xl font-semibold text-gray-800 mb-2">Error Loading Book</h2>
    <p class="text-gray-600 mb-4">{{ error }}</p>
    <Button label="Go Back" @click="$router.go(-1)" severity="secondary" />
  </div>

  <div v-else-if="userBook" class="book-detail max-w-6xl mx-auto px-4">
    <!-- Breadcrumb Navigation -->
    <div class="mb-6">
      <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
    </div>

    <!-- Book Header Section -->
    <div class="card-design mb-6">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Book Cover -->
        <div class="flex-shrink-0">
          <img
            :src="userBook.thumbnail || '/placeholder-book.png'"
            :alt="userBook.title"
            class="w-48 h-72 object-cover rounded-lg shadow-md"
            @error="handleImageError"
          />
        </div>

        <!-- Book Info -->
        <div class="flex-grow">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ userBook.title }}</h1>

          <p class="text-xl text-gray-700 mb-4">
            by {{ userBook.authors.join(', ') || 'Unknown Author' }}
          </p>

          <div class="flex items-center gap-4 mb-4">
            <div v-if="userBook.averageRating" class="flex items-center">
              <span class="text-yellow-500 text-lg">⭐</span>
              <span class="ml-1 font-semibold">{{ userBook.averageRating }}/5</span>
              <span class="text-gray-500 ml-1">({{ userBook.ratingsCount }} reviews)</span>
            </div>

            <span class="text-gray-500"> {{ userBook.pageCount }} pages </span>

            <span v-if="userBook.publishedDate" class="text-gray-500">
              Published {{ formatDate(userBook.publishedDate) }}
            </span>
          </div>

          <div class="mb-4">
            <span v-if="userBook.publisher" class="text-gray-600">
              Publisher: {{ userBook.publisher }}
            </span>
            <span v-if="userBook.language" class="text-gray-600 ml-3">
              Language: {{ userBook.language.toUpperCase() }}
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 mb-6">
            <Button
              label="Back to Library"
              icon="pi pi-arrow-left"
              severity="secondary"
              @click="$router.push('/library')"
            />
          </div>

          <!-- Categories -->
          <div v-if="userBook.categories && userBook.categories.length" class="mb-4">
            <div class="flex flex-wrap gap-2">
              <Chip
                v-for="category in userBook.categories"
                :key="category"
                :label="category"
                class="text-sm"
              />
            </div>
          </div>

          <!-- ISBN -->
          <div v-if="userBook.isbn" class="text-sm text-gray-500">ISBN: {{ userBook.isbn }}</div>
        </div>

        <!-- Library Status Card -->
        <div class="card-design">
          <h2 class="text-xl font-semibold mb-4">Your Reading Progress</h2>
          <div class="space-y-3">
            <div class="flex items-center">
              <Tag :value="userBook.status" :severity="getStatusSeverity(userBook.status)" />
            </div>
            <div v-if="userBook.dateAdded" class="text-sm text-gray-600">
              Added to library: {{ formatDate(userBook.dateAdded) }}
            </div>
            <div v-if="userBook.dateStarted" class="text-sm text-gray-600">
              Started reading: {{ formatDate(userBook.dateStarted) }}
            </div>
            <div v-if="userBook.dateFinished" class="text-sm text-gray-600">
              Finished reading: {{ formatDate(userBook.dateFinished) }}
            </div>
            <div v-if="userBook.userRating" class="flex items-center">
              <span class="text-yellow-500 mr-1">⭐</span>
              <span>Your rating: {{ userBook.userRating }}/5</span>
            </div>
            <div class="flex items-center">Pages Read: {{}}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- User progress -->
    <div class="mt-6">
      <ReadingSessionForm
        :bookId="userBook.bookId"
        :bookTitle="userBook.title"
        :bookStatus="userBook.status"
        :bookPages="userBook.pageCount"
        :bookData="userBook"
        @book-updated="handleBookUpdated"
        @book-completed="handleBookCompleted"
      />
    </div>

    <!-- Description Section -->
    <div v-if="userBook.description" class="card-design mb-6">
      <h2 class="text-xl font-semibold mb-4">Description</h2>
      <p class="text-gray-700 leading-relaxed">{{ userBook.description }}</p>
    </div>

    <!-- Book Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Book Details Card -->
      <div class="card-design">
        <h2 class="text-xl font-semibold mb-4">Book Details</h2>
        <div class="space-y-2">
          <div v-if="userBook.publishedDate" class="flex justify-between">
            <span class="text-gray-600">Published Date:</span>
            <span class="font-medium">{{ formatDate(userBook.publishedDate) }}</span>
          </div>
          <div v-if="userBook.publisher" class="flex justify-between">
            <span class="text-gray-600">Publisher:</span>
            <span class="font-medium">{{ userBook.publisher }}</span>
          </div>
          <div v-if="userBook.pageCount" class="flex justify-between">
            <span class="text-gray-600">Pages:</span>
            <span class="font-medium">{{ userBook.pageCount }}</span>
          </div>
          <div v-if="userBook.language" class="flex justify-between">
            <span class="text-gray-600">Language:</span>
            <span class="font-medium">{{ userBook.language.toUpperCase() }}</span>
          </div>
          <div v-if="userBook.isbn" class="flex justify-between">
            <span class="text-gray-600">ISBN:</span>
            <span class="font-medium">{{ userBook.isbn }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useBookStore } from '@/stores/books'
// import { useAuthStore } from '@/stores/auth'
import type { UserBook } from '@/types'

import { Breadcrumb, Button, Chip, Tag, ProgressSpinner } from 'primevue'

import ReadingSessionForm from '@/components/readingstats/ReadingSessionForm.vue'

const route = useRoute()
// const router = useRouter()
const bookStore = useBookStore()
// const authStore = useAuthStore()

const userBook = ref<UserBook | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const breadcrumbHome = {
  icon: 'pi pi-home',
  to: '/',
}

const breadcrumbItems = computed(() => [
  { label: 'Library', to: '/library' },
  { label: userBook.value?.title || 'Book Details' },
])

onMounted(async () => {
  const bookId = route.params.id as string

  if (!bookId) {
    error.value = 'No book ID provided'
    loading.value = false
    return
  }

  try {
    // Find the book in the user's library
    const foundBook = bookStore.userBooks.find((b) => b.id === bookId)

    if (!foundBook) {
      error.value = 'Book not found in your library'
      loading.value = false
      return
    }

    userBook.value = { ...foundBook }
    loading.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load book details'
    loading.value = false
  }
})

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusSeverity = (status: string): string => {
  switch (status) {
    case 'read':
      return 'success'
    case 'reading':
      return 'info'
    case 'to-read':
      return 'warning'
    default:
      return 'secondary'
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder-book.png'
}

const handleBookCompleted = (completedBook: UserBook) => {
  console.log('Book completed: ', {
    bookId: completedBook.id,
    title: completedBook.title,
    pages: completedBook.pageCount,
    completedAt: completedBook.dateFinished,
  })

  // TODO: Add any additional handling logic here - e.g., statistics update, notifications, achievements, social features, etc.
}

const handleBookUpdated = (updatedBook: UserBook) => {
  userBook.value = updatedBook
  const index = bookStore.userBooks.findIndex((b) => b.id === updatedBook.id)
  if (index !== -1) {
    bookStore.userBooks[index] = updatedBook
  }
}
</script>
