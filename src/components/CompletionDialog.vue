<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Congratulations!"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :closable="false"
  >
    <div class="flex flex-col items-center text-center">
      <i class="pi pi-trophy text-6xl text-yellow-500 mb-4"></i>
      <h3 class="text-2xl font-bold mb-2">You've finished reading!</h3>
      <p class="text-lg mb-4">
        Congratulations on completeting <strong>"{{ bookTitle }}"</strong>!
      </p>
      <p class="mb-2">Feel free to leave a review and your rating below</p>
      <Rating v-model="rating" />
      <Textarea
        v-model="review"
        rows="4"
        cols="30"
        placeholder="Leave a review (optional)"
        class="w-full my-4"
      />
      <Button label="Submit!" icon="pi pi-check" @click="closeDialog" :loading="submitting" />

      <p v-if="message" class="mt-2 p-2 rounded" :class="messageClass">{{ message }}</p>

      <p v-if="readingSessionsStore.error" class="mt-2 p-2 bg-red-100 text-red-700 rounded">
        {{ readingSessionsStore.error }}
      </p>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useReadingSessionsStore } from '@/stores/readingSession'
import type { UserBook } from '@/types'
import { userBookToDatabase } from '@/utils/bookTransformer'

import { Dialog, Button, Rating, Textarea } from 'primevue'

interface Props {
  show: boolean
  bookId: string
  bookTitle: string
  bookPages?: number | null | undefined
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(true)
const rating = ref()
const review = ref('')
const message = ref('')
const submitting = ref(false)
const readingSessionsStore = useReadingSessionsStore()

const messageClass = computed(() => {
  return message.value?.includes('Error')
    ? 'bg-red-100 text-red-700'
    : 'bg-green-100 text-green-700'
})

const closeDialog = async () => {
  submitting.value = true

  try {
    const ratingReview: Partial<UserBook> = {
      userRating: rating.value,
      userNotes: review.value,
    }

    const dbBookReview = userBookToDatabase(ratingReview)

    await readingSessionsStore.updateBookProgress(props.bookId, dbBookReview)

    message.value = 'Your review has been submitted successfully!'

    setTimeout(() => {
      visible.value = false
      submitting.value = false
    }, 3000)
  } catch (err) {
    message.value = 'An error occurred while submitting your review.'
    console.error(err)
    submitting.value = false
  }
}

const autoCloseTimer = setTimeout(() => {
  if (visible.value) {
    visible.value = false
  }
}, 30000)

watch(
  () => props.show,
  (newValue) => {
    visible.value = newValue
  },
)

watch(visible, (newValue) => {
  emit('update:show', newValue)
  if (!newValue) {
    clearTimeout(autoCloseTimer)
    emit('close')
  }
})
</script>
