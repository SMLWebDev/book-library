<template>
  <div class="card-design mb-5">
    <h3 class="text-2xl underline font-bold mb-4">
      Add your reading session details for {{ bookTitle }} here
    </h3>

    <div class="space-y-2 mb-4 flex flex-col gap-2">
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
          :max="10000"
          showButtons
          :step="1"
          size="small"
        />
      </div>
      <div>
        <label>Pages Read: {{ pagesRead }}</label>
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useReadingSessionsStore } from '@/stores/readingSession'
import { useAuthStore } from '@/stores/auth'

import { formatDateForDB } from '@/utils/dateFormatter'

import { Button, InputNumber, DatePicker } from 'primevue'

import ReadingSessionList from '@/components/readingstats/ReadingSessionList.vue'

const authStore = useAuthStore()
const readingSessionsStore = useReadingSessionsStore()

const startPage = ref(1)
const endPage = ref(10)
const dateRead = ref(new Date())
const message = ref<string | null>(null)

const props = defineProps<{
  bookId: string
  bookTitle: string
}>()

const pagesRead = computed(() => {
  return endPage.value - startPage.value + 1
})

const messageClass = computed(() => {
  return message.value?.includes('Error')
    ? 'bg-red-100 text-red-700'
    : 'bg-green-100 text-green-700'
})

const addSession = async () => {
  if (!authStore.user) {
    message.value = 'Please log in first'
    return
  }

  try {
    const sessionData = {
      user_id: authStore.user.id,
      book_id: props.bookId,
      pages_read: pagesRead.value,
      start_page: startPage.value,
      end_page: endPage.value,
      date_read: formatDateForDB(dateRead.value),
    }

    await readingSessionsStore.addSession(sessionData)
    message.value = `Added reading session for ${pagesRead.value} pages read on ${dateRead.value.toDateString()}`

    startPage.value = endPage.value + 1
    endPage.value = startPage.value + 9
  } catch (error) {
    message.value = 'Error adding session'
    console.error('Error adding sessions: ', error)
  }
}

watch(message, (newMessage) => {
  if (newMessage) {
    setTimeout(() => {
      message.value = null
      readingSessionsStore.clearError()
    }, 3000)
  }
})
</script>
