<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">My Library</h1>

      <div class="flex space-x-2">
        <Button label="Search Books" icon="pi pi-search" @click="showSearch = true" />
      </div>
    </div>

    <div v-if="bookStore.loading" class="text-center py-8">
      <ProgressSpinner />
      <p class="mt-2 text-gray-600">Loading your library...</p>
    </div>

    <div v-else>
      <div class="mb-6">
        <LibraryFilters v-model:status="currentStatus" v-model:sort="currentSort" />
      </div>

      <div
        v-if="filteredBooks.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <LibraryBookCard
          v-for="book in filteredBooks"
          :key="book.id"
          :book="book"
          @update-status="updateBookStatus"
        />
      </div>

      <div v-else class="text-center py-2 bg-gray-50 rounded-lg">
        <div class="text-gray-400 mb-4">
          <i class="pi pi-book" style="font-size: 3rem"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-600 mb-2">Your library is empty</h3>
        <p class="text-gray-500 mb-4">Start by searching for books to add to your collection.</p>

        <Button label="Search Books" @click="showSearch = true" />
      </div>
    </div>

    <Dialog
      v-model:visible="showSearch"
      header="Search Books"
      :style="{ width: '80vw', maxWidth: '1000px' }"
      :modal="true"
    >
      <BookSearch @add-to-library="handleBookAdded" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBookStore } from '@/stores/books'
import { useAuthStore } from '@/stores/auth'
import { Dialog, Button, ProgressSpinner } from 'primevue'
import LibraryFilters from '@/components/LibraryFilters.vue'
import LibraryBookCard from '@/components/LibraryBookCard.vue'
import BookSearch from '@/components/BookSearch.vue'

const authStore = useAuthStore()
const bookStore = useBookStore()
const showSearch = ref(false)
const currentStatus = ref<'all' | 'read' | 'to-read' | 'reading'>('all')
const currentSort = ref<'date-added' | 'title' | 'author'>('date-added')

onMounted(() => {
  if (authStore.user) {
    bookStore.fetchUserBooks()
  }
})

const filteredBooks = computed(() => {
  let books = [...bookStore.userBooks]

  if (currentStatus.value !== 'all') {
    books = books.filter((book) => book.status === currentStatus.value)
  }

  switch (currentSort.value) {
    case 'title':
      books.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'author':
      books.sort((a, b) => {
        const authorA = a.authors[0] || ''
        const authorB = b.authors[0] || ''
        return authorA.localeCompare(authorB)
      })
      break
    case 'date-added':
    default:
      books.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      break
  }

  return books
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateBookStatus = async (bookId: string, status: string, dates: any) => {
  try {
    await bookStore.updateBookStatus(bookId, status, dates)
  } catch (error) {
    console.error('Failed to update books status: ', error)
  }
}

const handleBookAdded = () => {
  showSearch.value = false
  bookStore.fetchUserBooks()
}
</script>
