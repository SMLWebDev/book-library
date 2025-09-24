<template>
  <div class="card-design mb-5">
    <h3 class="text-2xl underline font-bold mb-4">
      Add your reading session details for {{ bookTitle }} here
    </h3>

    <div class="space-y-2 mb-4">
      <div>
        <label>Start Page</label>
        <InputNumber
          v-model.number="startPage"
          :min="1"
          :max="1000"
          :showButtons="true"
          :buttonLayout="'horizontal'"
          :step="1"
          class="border p-1"
        />
      </div>
      <div>
        <label>End Page</label>
        <InputNumber
          v-model.number="endPage"
          :min="1"
          :max="1000"
          :showButtons="true"
          :buttonLayout="'horizontal'"
          :step="1"
          class="border p-1"
        />
      </div>
      <div>
        <label>Pages Read: {{ pagesRead }}</label>
      </div>
    </div>
    <Button label="Add Session" @click="addSession" />
    <p v-if="message">{{ message }}</p>
  </div>

  <ReadingSessionList />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import { Button, InputNumber } from 'primevue'

import ReadingSessionList from '@/components/readingstats/ReadingSessionList.vue'

const authStore = useAuthStore()
const message = ref<string | null>(null)

const startPage = ref(1)
const endPage = ref(10)

const props = defineProps<{
  bookId: string
  bookTitle: string
}>()

const pagesRead = computed(() => {
  return endPage.value - startPage.value + 1
})

const addSession = async () => {
  try {
    if (!authStore.user) {
      message.value = 'Please log in first'
      return
    }

    const sessionData = {
      user_id: authStore.user.id,
      book_id: props.bookId,
      pages_read: pagesRead.value,
      start_page: startPage.value,
      end_page: endPage.value,
    }

    const { data, error } = await supabase.from('reading_sessions').insert([sessionData]).select()

    if (error) throw error

    message.value = `Added reading session for ${pagesRead.value} pages`

    startPage.value = endPage.value + 1
    endPage.value = startPage.value + 9
  } catch (error) {
    message.value = 'Error adding session'
    console.error('Error adding sessions: ', error)
  }
}
</script>
