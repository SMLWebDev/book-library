import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../api/supabase'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(true)

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

  return {
    user,
    isLoading,
    initializeAuth,
    signUp,
    signIn,
    signOut,
  }
})