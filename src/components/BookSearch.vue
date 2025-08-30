<template>
  <div class="book-search">
    <div class="flex gap-4 mb-6">
      <div class="flex-grow">
        <InputText
          v-model="searchInput"
          placeholder="Search for books by title, author, or keyword..."
          class="w-full"
          @keyup.enter="performSearch"
        />
      </div>
      <Button label="Search" @click="performSearch" :loading="searchStore.isLoading" />
    </div>

    <div v-if="searchStore.error" class="p-3 bg-red-100 text-red-700 rounded-md mb-6">
      {{ searchStore.error }}
    </div>

    <div v-if="searchStore.searchResults.length > 0" class="search-results">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">
          Found {{ searchStore.totalResults }} results for "{{ searchStore.searchQuery }}"
        </h3>

        <div class="flex items-center space-x-2">
          <Button
            icon="pi pi-chevron-left"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage <= 1"
            severity="secondary"
            size="small"
          />
          <span class="text-sm">Page {{ currentPage }} of {{ totalPages }}</span>
          <Button
            icon="pi pi-chevron-right"
            @click="goToPage(currentPage + 1)"
            :disabeld="currentPage >= totalPages"
            severity="secondary"
            size="small"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BookSearchResult
          v-for="book in searchStore.searchResults"
          :key="book.id"
          :book="book"
          @add-to-library="addToLibrary"
        />
      </div>
    </div>

    <div v-else-if="searchStore.searchQuery && !searchStore.isLoading" class="text-center py-8">
      <p class="text-gray-500">No books found. Try a different search term.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSearchStore, useBookStore, useAuthStore } from '@/stores'
import type { Book } from '@/types'

import { InputText, Button } from 'primevue'

import { BookSearchResult } from '@/components/BookSearchResult.vue'

const searchStore = useSearchStore()
const bookStore = useBookStore()
const authStore = useAuthStore()

const searchInput = ref('')

const currentPage = computed(() => searchStore.currentPage)
const totalPages = computed(() => Math.ceil(searchStore.totalResults / searchStore.resultsPerPage))

const performSearch = () => {
  if (searchInput.value.trim()) {
    searchStore.searchBooks(searchInput.value.trim())
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    searchStore.searchBooks(searchStore.searchQuery, page)
  }
}

const addToLibrary = async (book: Book) => {
  if (!authStore.user) {
    console.log('Please log in to add books to your library')
    return
  }

  try {
    const userBook = {
      ...book,
      status: 'to-read' as const,
      dateAdded: new Date().toISOString(),
      userRating: null,
      userNotes: null,
    }

    await bookStore.addBook(userBook)
  } catch (error) {
    console.error('Failed to add book to library: ', error)
  }
}
</script>
