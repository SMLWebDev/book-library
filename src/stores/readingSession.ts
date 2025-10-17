import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import type { ReadingSessions, NewReadingSession, UserBook } from '@/types'
import { transformReadingSessions, transformReadingSession, newReadingSessionToDatabase } from '@/utils/readingSessionTransformer'

export const useReadingSessionsStore = defineStore('readingSessions', () => {
    const sessions = ref<ReadingSessions[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const authStore = useAuthStore()

    const totalPagesRead = computed(() => sessions.value.reduce((sum, session) => sum + (session.pagesRead ?? 0), 0))

    const readingDaysCount = computed(() => new Set(sessions.value.map(s => s.dateRead)).size)

    const averagePagesPerSession = computed(() => sessions.value.length > 0 ? totalPagesRead.value / sessions.value.length : 0)

    // Reading Sessions for reading_sessions table
    const fetchSessions = async (userId: string) => {
        loading.value = true
        error.value = null
        try {
            const { data, error: supabaseError } = await supabase
                .from('reading_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('date_read', { ascending: true })
                
            if (supabaseError) throw supabaseError
            sessions.value = transformReadingSessions(data || [])
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to load sessions'
            console.error('Error fetching sessions: ', err)
        } finally {
            loading.value = false
        }
    }

    const addSession = async (sessionData: NewReadingSession) => {
        try {
            loading.value = true
            error.value = null

            const dbData = newReadingSessionToDatabase(sessionData)

            const { data, error: supabaseError } = await supabase
                .from('reading_sessions')
                .insert([dbData])
                .select()

            if (supabaseError) throw supabaseError

            if (data && data.length > 0) {
                const transformedSession = transformReadingSession(data[0])
                sessions.value.unshift(transformedSession)
            }

            return data?.[0]
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to add session'
            console.error('Error adding session: ', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Book Progress for user_book table
    const updateBookProgress = async (bookId: string, bookProgress: Partial<UserBook>) => {
        if (!authStore.user) {
            return
        }

        try {
            loading.value = true
            error.value = null

            const { data: userBook, error: findError } = await supabase
                .from('user_books')
                .select('id')
                .eq('book_id', bookId)
                .eq('user_id', authStore.user.id)
                .single()

            if (findError) throw findError
            if (!userBook) throw new Error('User book not found')

            const { data, error: supabaseError } = await supabase
                .from('user_books')
                .update(bookProgress)
                .eq('id', userBook.id)

            if (supabaseError) throw supabaseError
            return data
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update book progress'
            console.error('Error updating book progress: ', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const clearError = () => {
        error.value = null
    }

    return {
        sessions,
        loading,
        error,
        totalPagesRead,
        readingDaysCount,
        averagePagesPerSession,
        fetchSessions,
        addSession,
        updateBookProgress,
        clearError
    }
})