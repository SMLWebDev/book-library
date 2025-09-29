<template>
  <div class="card-design">
    <h3 class="text-xl font-bold mb-4 text-center">Reading Stats</h3>

    <div v-if="readingSessionsStore.loading" class="loading">Loading Sessions...</div>

    <div v-else-if="readingSessionsStore.error" class="error p-3 bg-red-100 text-red-700 rounded">
      {{ readingSessionsStore.error }}
    </div>

    <div v-else>
      <div v-if="readingSessionsStore.sessions.length === 0" class="text-gray-500">
        You haven't recorded any reading sessions yet.
      </div>

      <div v-else>
        <!-- Statistics Summary -->
        <div class="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded">
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-600">
              {{ readingSessionsStore.totalPagesRead }}
            </div>
            <div class="text-sm text-gray-600">Total Pages</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-600">
              {{ readingSessionsStore.readingDaysCount }}
            </div>
            <div class="text-sm text-gray-600">Reading Days</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-600">
              {{ Math.round(readingSessionsStore.averagePagesPerSession) }}
            </div>
            <div class="text-sm text-gray-600">Avg per Session</div>
          </div>
        </div>

        <!-- Session List -->
        <div class="space-y-3">
          <div
            v-for="session in readingSessionsStore.sessions"
            :key="session.id"
            class="p-3 border rounded hover:bg-gray-50"
          >
            <div class="flex justify-between items-center">
              <span class="font-semibold">{{ session.pages_read }} pages</span>
              <span class="text-sm text-gray-500">{{ formatDate(session.date_read) }}</span>
            </div>
            <div v-if="session.start_page && session.end_page" class="text-sm text-gray-600">
              Pages {{ session.start_page }} - {{ session.end_page }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useReadingSessionsStore } from '@/stores/readingSession'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const readingSessionsStore = useReadingSessionsStore()

onMounted(() => {
  if (authStore.user) {
    readingSessionsStore.fetchSessions(authStore.user.id)
  }
})

watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      readingSessionsStore.fetchSessions(newUser.id)
    } else {
      readingSessionsStore.sessions = []
    }
  },
)

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'No date'

  return new Date(dateString).toLocaleDateString()
}
</script>
