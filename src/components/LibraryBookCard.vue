<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div
    class="library-book-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
  >
    <div class="relative">
      <RouterLink :to="`/library/book/${book.id}`">
        <img
          :src="book.thumbnail || '/placeholder-book.svg'"
          :alt="book.title"
          class="w-full h-48 object-cover"
          @error="handleImageError"
        />
      </RouterLink>

      <div class="absolute top-2 right-2">
        <Tag :value="book.status" :severity="statusSeverity" />
      </div>
    </div>

    <div class="p-4">
      <RouterLink :to="`/library/book/${book.id}`">
        <h3 class="font-semibold text-gray-600 text-lg mb-1 line-clamp-2">{{ book.title }}</h3>
      </RouterLink>

      <p class="text-gray-600 text-sm mb-2">by {{ book.authors.join(', ') || 'Unknown Author' }}</p>

      <div class="flex items-center justify-between mb-3">
        <span class="text-xs text-gray-500">
          Pages: {{ book.pageCount ? `${book.pageCount} pages` : 'Unknown' }} <br />
          Published:
          {{ book.publishedDate ? `- ${new Date(book.publishedDate).getFullYear()}` : '' }}
        </span>

        <div v-if="book.userRating" class="flex-items-center">
          <span class="text-yellow-500 text-sm mr-1">⭐</span>
          <span class="text-sm font-medium">{{ book.userRating }}/5</span>
        </div>
      </div>

      <div class="flex space-x-2">
        <!-- TODO-FEAT: Add option to remove book from library -->
        <Button
          icon="pi pi-times"
          label="Remove"
          severity="danger"
          variant="text"
          class="text-sm"
        />
      </div>

      <div class="mt-3 p-2 bg-gray-50 rounded text-sm">
        <p class="text-gray-700 line-clamp-2">{{ book.userNotes }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserBook } from '@/types'
import { Button, Tag } from 'primevue'

const props = defineProps<{
  book: UserBook
}>()

const statusSeverity = computed(() => {
  switch (props.book.status) {
    case 'read':
      return 'success'
    case 'reading':
      return 'info'
    case 'to-read':
      return 'warning'
    default:
      return 'secondary'
  }
})

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder-book.svg'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
