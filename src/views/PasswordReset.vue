<template>
  <div class="max-w-md mx-auto card-design">
    <h2 class="text-2xl font-bold text-center mb-4">Reset Password</h2>
    <p class="text-gray-600 text-center mb-6">
      Enter your email address below and we'll send you a link to reset your password.
    </p>

    <form @submit.prevent="handlePasswordReset" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <InputText
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          class="w-full"
          :class="{ 'p-invalid': errorMessage || (submitted && !email) }"
        />
        <small v-if="submitted && !email" class="text-red-500">Email is required</small>
      </div>

      <Button label="Send Reset Link" class="w-full" :loading="loading" />

      <div v-if="successMessage" class="p-3 bg-green-100 text-green-700 rounded-md">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="p-3 bg-red-100 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>
    </form>

    <div class="mt-6 text-center">
      <router-link to="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">
        Back to Login
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { InputText, Button } from 'primevue'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handlePasswordReset = async () => {
  submitted.value = true
  errorMessage.value = ''
  successMessage.value = ''

  // Basic validation
  if (!email.value) {
    errorMessage.value = 'Email is required'
    return
  }

  loading.value = true

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) throw error

    successMessage.value = 'Password reset link sent! Check your email for the reset link.'
    email.value = ''
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to send reset email'
    }
  } finally {
    loading.value = false
  }
}
</script>
