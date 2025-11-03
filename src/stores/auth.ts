import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../api/supabase'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(true)
  const error = ref('')

  const initializeAuth = async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user
        ? {
            ...session.user,
            email: session.user.email ?? '',
          }
        : null
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state changed:', event)
          user.value = session?.user
            ? {
                ...session.user,
                email: session.user.email ?? '',
              }
            : null
          isLoading.value = false
        }
      )
      
      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Error initializing auth:', error)
      isLoading.value = false
    }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    isLoading.value = true
    error.value = ''

    try {
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (supabaseError) throw supabaseError
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send reset email'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updatePassword = async (newPassword: string) => {
    isLoading.value = true
    error.value = ''

    try {
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (supabaseError) throw supabaseError
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update password'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    initializeAuth,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  }
})