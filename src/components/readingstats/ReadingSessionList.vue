<template>
  <div>
    <div v-if="loading" class="loading">Loading Sessions...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="card-design">
      <h3>Reading Stats</h3>
      <div v-if="!sessions">You haven't recorded any reading sessions yet.</div>
      <div v-else v-for="session in sessions" :key="session.id">
        {{ session.pages_read }} pages read on {{ session.date_read }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'
import type { ReadingSessions } from '@/types'

const authStore = useAuthStore()
const sessions = ref<ReadingSessions[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  await showSessions()
})

const showSessions = async () => {
  if (!authStore.user) return

  loading.value = true
  try {
    const { data, error } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', authStore.user.id)

    if (error) throw error
    sessions.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unknown error occurred'
  } finally {
    loading.value = false
  }
}
</script>
