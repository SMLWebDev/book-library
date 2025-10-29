<template>
  <div class="card-design mb-5">
    <h3 class="text-2xl underline font-bold mb-4">
      Add your reading session details for
      <span class="font-black text-indigo-600">{{ bookTitle }}</span> here
    </h3>

    <div class="space-y-2 mb-4 flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <div>
          <label for="dateStarted" class="mr-2">Date started reading</label>
          <DatePicker
            v-model="dateStarted"
            showIcon
            size="small"
            class="mr-2"
            dateFormat="dd/mm/yy"
          />
        </div>
        <div>
          <label for="finishedDate" class="mr-2">Finished Date</label>
          <DatePicker
            v-model="finishedDate"
            showIcon
            size="small"
            class="flex-1"
            dateFormat="dd/mm/yy"
            :disabled="autoDetectedFinish"
          />
          <span v-if="autoDetectedFinish" class="ml-2 text-sm text-green-600">(Auto-detected)</span>
        </div>
        <div>
          <label for="selectedStatus" class="mr-2">Reading Status</label>
          <Select
            v-model="selectedStatus"
            :options="readingStatus"
            optionLabel="name"
            :placeholder="currentBookStatus"
            checkmark
            :highlightOnSelect="true"
          />
        </div>
      </div>

      <hr />
      <div class="flex flex-row justify-between items-center gap-4">
        <div class="flex items-center">
          <label for="startDate" class="mr-2 w-20">Date Read</label>
          <DatePicker v-model="dateRead" showIcon size="small" class="mr-2" dateFormat="dd/mm/yy" />
        </div>
        <div class="flex items-center">
          <label for="startPage" class="mr-2 w-20">Start Page</label>
          <InputNumber
            v-model.number="startPage"
            :min="1"
            :max="1000"
            showButtons
            :step="1"
            size="small"
          />
        </div>
        <div class="flex items-center">
          <label for="endPage" class="mr-2 w-20">End Page</label>
          <InputNumber
            v-model.number="endPage"
            :min="1"
            :max="bookPages || 10000"
            showButtons
            :step="1"
            size="small"
          />
        </div>
      </div>
    </div>
    <Button
      label="Add Session"
      @click="addSession"
      :loading="readingSessionsStore.loading"
      :disabled="readingSessionsStore.loading"
    />
    <p v-if="message" class="mt-2 p-2 rounded" :class="messageClass">{{ message }}</p>

    <p v-if="readingSessionsStore.error" class="mt-2 p-2 bg-red-100 text-red-700 rounded">
      {{ readingSessionsStore.error }}
    </p>
  </div>

  <ReadingSessionList />

  <CompletionDialog
    v-model:show="showCongratulations"
    :bookId="props.bookId"
    :bookTitle="bookTitle"
    :bookPages="props.bookPages || 0"
    @close="handleDialogClose"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useReadingSessionsStore } from '@/stores/readingSession'
import { useAuthStore } from '@/stores/auth'

import type { UserBook } from '@/types'
import { formatDateForDB } from '@/utils/dateFormatter'
import { userBookToDatabase } from '@/utils/bookTransformer'

import { Button, InputNumber, DatePicker, Select } from 'primevue'

import ReadingSessionList from '@/components/readingstats/ReadingSessionList.vue'
import CompletionDialog from '../CompletionDialog.vue'

const authStore = useAuthStore()
const readingSessionsStore = useReadingSessionsStore()

const startPage = ref(1)
const endPage = ref(10)
const dateRead = ref(new Date())
const message = ref<string | null>(null)
const showCongratulations = ref(false)
const completedBookData = ref<UserBook | null>(null)

const dateStarted = ref(new Date())
const finishedDate = ref<Date | null>(null)
const selectedStatus = ref()

const props = defineProps<{
  bookId: string
  bookTitle: string
  bookStatus: UserBook['status']
  bookPages: number | null | undefined
  bookData: UserBook
}>()

const pagesRead = computed(() => {
  return endPage.value - startPage.value + 1
})

const isBookFinished = computed(() => {
  return props.bookPages ? endPage.value >= props.bookPages : false
})

const autoDetectedFinish = computed(() => {
  return isBookFinished.value && !finishedDate.value
})

const currentBookStatus = computed(() => props.bookData.status)

interface Emits {
  (e: 'book-updated', bookData: UserBook): void
  (e: 'book-completed', bookData: UserBook): void
}

const emit = defineEmits<Emits>()

const messageClass = computed(() => {
  return message.value?.includes('Error')
    ? 'bg-red-100 text-red-700'
    : 'bg-green-100 text-green-700'
})

const readingStatus = ref([
  { name: 'To Read', value: 'to-read' },
  { name: 'Reading', value: 'reading' },
  { name: 'Read', value: 'read' },
])

const addSession = async () => {
  if (!authStore.user) {
    message.value = 'Please log in first'
    return
  }

  try {
    const sessionData = {
      userId: authStore.user.id,
      bookId: props.bookId,
      pagesRead: pagesRead.value,
      startPage: startPage.value,
      endPage: endPage.value,
      dateRead: formatDateForDB(dateRead.value),
    }

    const bookProgress: Partial<UserBook> = {
      dateStarted: formatDateForDB(dateStarted.value),
      status: selectedStatus.value ? selectedStatus.value.value : 'to-read',
      dateFinished: finishedDate.value ? formatDateForDB(finishedDate.value) : null,
    }

    const isNewCompletion = isBookFinished.value && props.bookStatus !== 'read'

    if (isBookFinished.value || finishedDate.value) {
      bookProgress.status = 'read'
      bookProgress.dateFinished = finishedDate.value
        ? formatDateForDB(finishedDate.value)
        : formatDateForDB(new Date())

      completedBookData.value = {
        ...props.bookData,
        status: 'read',
        dateFinished: bookProgress.dateFinished,
      }

      if (isNewCompletion) {
        showCongratulations.value = true
      }
    }

    const dbBookProgress = userBookToDatabase(bookProgress)

    await readingSessionsStore.addSession(sessionData)
    await readingSessionsStore.updateBookProgress(props.bookId, dbBookProgress)

    if (isBookFinished.value || finishedDate.value) {
      emit('book-updated', {
        ...props.bookData,
        status: 'read',
        dateFinished: bookProgress.dateFinished,
      })
    }

    if (isBookFinished.value) {
      message.value = `Congratulations! You finished "${props.bookTitle}"!`
    } else {
      message.value = `Added reading session for ${pagesRead.value} pages read on ${dateRead.value.toDateString()}`
    }

    if (!isBookFinished.value) {
      startPage.value = endPage.value + 1
      endPage.value = Math.min(startPage.value + 9, props.bookPages || 10000)
    }
  } catch (error) {
    message.value = 'Error adding session'
    console.error('Error adding sessions: ', error)
  }
}

const handleDialogClose = () => {
  console.log('Completion dialog closed')
}

watch(isBookFinished, (finished) => {
  if (finished && !finishedDate.value) {
    finishedDate.value = new Date()
    selectedStatus.value = 'read'
    message.value = 'Book Completed! Finished date auto-set to today.'
  }
})

watch(message, (newMessage) => {
  if (newMessage) {
    setTimeout(() => {
      message.value = null
      readingSessionsStore.clearError()
    }, 3000)
  }
})
</script>
