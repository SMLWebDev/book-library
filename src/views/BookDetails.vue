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

  <div v-else-if="book" class="book-detail">
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
            :src="book.thumbnail || '/placeholder-book.png'"
            :alt="book.title"
            class="w-48 h-72 object-cover rounded-lg shadow-md"
            @error="handleImageError"
          />
        </div>

        <!-- Book Info -->
        <div class="flex-grow">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ book.title }}</h1>

          <p class="text-xl text-gray-700 mb-4">
            by {{ book.authors.join(', ') || 'Unknown Author' }}
          </p>

          <div class="flex items-center gap-4 mb-4">
            <div v-if="book.averageRating" class="flex items-center">
              <span class="text-yellow-500 text-lg">⭐</span>
              <span class="ml-1 font-semibold">{{ book.averageRating }}/5</span>
              <span class="text-gray-500 ml-1">({{ book.ratingsCount }} reviews)</span>
            </div>

            <span v-if="book.pageCount" class="text-gray-500"> {{ book.pageCount }} pages </span>

            <span v-if="book.publishedDate" class="text-gray-500">
              Published {{ formatDate(book.publishedDate) }}
            </span>
          </div>

          <div class="mb-4">
            <span v-if="book.publisher" class="text-gray-600">
              Publisher: {{ book.publisher }}
            </span>
            <span v-if="book.language" class="text-gray-600 ml-3">
              Language: {{ book.language.toUpperCase() }}
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 mb-6">
            <Button
              :label="libraryButtonLabel"
              :icon="libraryButtonIcon"
              :severity="libraryButtonSeverity"
              :disabled="isInLibrary"
              :loading="addingToLibrary"
              @click="handleLibraryAction"
            />

            <Button
              label="Back to Search"
              icon="pi pi-arrow-left"
              severity="secondary"
              @click="$router.go(-1)"
            />
          </div>

          <!-- Categories -->
          <div v-if="book.categories && book.categories.length" class="mb-4">
            <div class="flex flex-wrap gap-2">
              <Chip
                v-for="category in book.categories"
                :key="category"
                :label="category"
                class="text-sm"
              />
            </div>
          </div>

          <!-- ISBN -->
          <div v-if="book.isbn" class="text-sm text-gray-500">ISBN: {{ book.isbn }}</div>
        </div>
      </div>
    </div>

    <!-- Description Section -->
    <div v-if="book.description" class="card-design mb-6">
      <h2 class="text-xl font-semibold mb-4">Description</h2>
      <p class="text-gray-700 leading-relaxed">{{ book.description }}</p>
    </div>

    <!-- Additional Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Book Details Card -->
      <div class="card-design text-gray-600">
        <h2 class="text-xl font-semibold mb-4">Book Details</h2>
        <div class="space-y-2">
          <div v-if="book.publishedDate" class="flex justify-between">
            <span class="text-gray-600">Published Date:</span>
            <span class="font-medium">{{ formatDate(book.publishedDate) }}</span>
          </div>
          <div v-if="book.publisher" class="flex justify-between">
            <span class="text-gray-600">Publisher:</span>
            <span class="font-medium">{{ book.publisher }}</span>
          </div>
          <div v-if="book.pageCount" class="flex justify-between">
            <span class="text-gray-600">Pages:</span>
            <span class="font-medium">{{ book.pageCount }}</span>
          </div>
          <div v-if="book.language" class="flex justify-between">
            <span class="text-gray-600">Language:</span>
            <span class="font-medium">{{ book.language.toUpperCase() }}</span>
          </div>
          <div v-if="book.isbn" class="flex justify-between">
            <span class="text-gray-600">ISBN:</span>
            <span class="font-medium">{{ book.isbn }}</span>
          </div>
        </div>
      </div>

      <!-- Library Status Card -->
      <div class="card-design text-gray-600">
        <h2 class="text-xl font-semibold mb-4">Library Status</h2>
        <div v-if="userBook" class="space-y-3">
          <div class="flex items-center">
            <Tag :value="userBook.status" :severity="getStatusSeverity(userBook.status)" />
          </div>
          <div v-if="userBook.dateAdded" class="text-sm text-gray-600">
            Added: {{ formatDate(userBook.dateAdded) }}
          </div>
          <div v-if="userBook.dateStarted" class="text-sm text-gray-600">
            Started: {{ formatDate(userBook.dateStarted) }}
          </div>
          <div v-if="userBook.dateFinished" class="text-sm text-gray-600">
            Finished: {{ formatDate(userBook.dateFinished) }}
          </div>
          <div v-if="userBook.userRating" class="flex items-center">
            <span class="text-yellow-500 mr-1">⭐</span>
            <span>Your rating: {{ userBook.userRating }}/5</span>
          </div>
        </div>
        <div v-else class="text-gray-500">This book is not in your library yet.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookStore } from '@/stores/books'
import { useAuthStore } from '@/stores/auth'
import type { Book, UserBook } from '@/types'
import { googleBooksApi } from '@/api/googleBooks'
import { Breadcrumb, Button, Chip, Tag, ProgressSpinner } from 'primevue'

const route = useRoute()
const router = useRouter()
const bookStore = useBookStore()
const authStore = useAuthStore()

const book = ref<Book | null>(null)
const userBook = ref<UserBook | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const addingToLibrary = ref(false)

const breadcrumbHome = {
  icon: 'pi pi-home',
  to: '/',
}

const breadcrumbItems = computed(() => [
  { label: 'Search', to: '/' },
  { label: book.value?.title || 'Book Details' },
])

const isInLibrary = computed(() => {
  return bookStore.userBooks.some((b) => b.id === route.params.id)
})

const libraryButtonLabel = computed(() => {
  if (!authStore.user) return 'Sign in to add'
  if (addingToLibrary.value) return 'Adding...'
  return isInLibrary.value ? 'In Your Library' : 'Add to Library'
})

const libraryButtonIcon = computed(() => {
  if (!authStore.user) return 'pi pi-user'
  if (addingToLibrary.value) return 'pi pi-spin pi-spinner'
  return isInLibrary.value ? 'pi pi-check' : 'pi pi-plus'
})

const libraryButtonSeverity = computed(() => {
  if (!authStore.user) return 'secondary'
  return isInLibrary.value ? 'success' : 'primary'
})

onMounted(async () => {
  const bookId = route.params.id as string

  if (!bookId) {
    error.value = 'No book ID provided'
    loading.value = false
    return
  }

  try {
    // Check if book is already in user's library
    userBook.value = bookStore.userBooks.find((b) => b.id === bookId) || null

    // Fetch book details from Google Books API
    book.value = await googleBooksApi.getBook(bookId)
    loading.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load book details'
    loading.value = false
  }
})

const handleLibraryAction = async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  if (!isInLibrary.value && book.value) {
    addingToLibrary.value = true
    try {
      const userBookObj: UserBook = {
        ...book.value,
        status: 'to-read',
        dateAdded: new Date().toISOString(),
        dateStarted: null,
        dateFinished: null,
        userRating: null,
        userNotes: null,
      }

      await bookStore.addBook(userBookObj)
      userBook.value = userBookObj
    } catch (err) {
      console.error('Failed to add book to library:', err)
    } finally {
      addingToLibrary.value = false
    }
  }
}

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
</script>

<style scoped>
.book-detail {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
