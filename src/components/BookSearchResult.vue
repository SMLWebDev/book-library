<template>
  <div
    class="book-result bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
  >
    <div class="flex">
      <div class="w-1/3">
        <img
          :src="book.thumbnail || '/placeholder-book.svg'"
          :alt="book.title"
          class="w-full h-48 object-cover"
          @error="handleImageError"
        />
      </div>

      <div class="w-2/3 p-4">
        <RouterLink :to="`/book/${book.title}`" class="block">
          <h3 class="font-bold text-lg text-gray-600 tracking-wide mb-1 line-clamp-2">
            {{ book.title }}
          </h3>
        </RouterLink>

        <p class="text-gray-600 text-sm mb-2">
          by {{ book.authors.join(', ') || 'Unknown Author' }}
        </p>

        <div class="flex items-center mb-2">
          <span class="text-green-600 text-sm">
            {{ book.averageRating ? `⭐ ${book.averageRating}` : 'No ratings' }}
          </span>
          <span class="text-gray-500 text-sm">
            {{ book.ratingsCount ? `${book.ratingsCount} reviews` : '' }}
          </span>
        </div>

        <p class="text-gray-700 text-sm mb-3 line-clamp-3">
          {{ book.description || 'No description available.' }}
        </p>

        <div class="flex justify-between items-center">
          <Button
            :label="buttonLabel"
            size="small"
            @click="$emit('add-to-library', book)"
            :disabled="isInLibrary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBookStore } from '@/stores/books'
import type { Book } from '@/types'
import Button from 'primevue/button'

const props = defineProps<{
  book: Book
}>()

defineEmits<{
  (e: 'add-to-library', book: Book): void
}>()

const bookStore = useBookStore()

console.info('Da Props: ', props)

const isInLibrary = computed(() => {
  return bookStore.userBooks.some((b) => b.id === props.book.id)
})

const buttonLabel = computed(() => {
  return isInLibrary.value ? 'In your Library' : 'Add to Library'
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
