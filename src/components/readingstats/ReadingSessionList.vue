<template>
  <div></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'
import type { ReadingSessions } from '@/types'

const authStore = useAuthStore()
const sessions = ref<ReadingSessions[]>([])

const showSessions = async () => {
  if (!authStore.user || !authStore.user.id) {
    message.value = 'Please log in first'
    return
  }

  const { data, error } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('user_id', authStore.user.id)

  if (error) throw error
  sessions.value = data
}
</script>
