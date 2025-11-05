<template>
  <div class="card-design max-w-md mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-center">Reset Your Password</h2>
    <p class="text-gray-600 mb-6 text-center">
      Enter your email address and we'll send you a link to reset your password.
    </p>

    <form @submit.prevent="handleResetRequest" class="space-y-4">
      <div class="field">
        <label for="reset-email" class="block mb-2 font-medium">Email Address</label>
        <InputText
          id="reset-email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          class="w-full"
          :class="{ 'p-invalid': error }"
          autocomplete="email"
        />
        <small v-if="error" class="p-error">{{ error }}</small>
      </div>

      <Button
        type="submit"
        label="Send Reset Link"
        class="w-full"
        :loading="loading"
        :disabled="loading"
      />
    </form>

    <Message v-if="successMessage" severity="success" class="mt-4">
      {{ successMessage }}
    </Message>

    <div class="text-center mt-4">
      <Button label="Back to Login" link @click="emit('back-to-login')" :disabled="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { InputText, Button, Message } from 'primevue'

interface Emits {
  (e: 'back-to-login'): void
}

const emit = defineEmits<Emits>()
const authStore = useAuthStore()

const email = ref('')
const loading = ref(false)
const successMessage = ref('')
const error = ref('')

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleResetRequest = async () => {
  error.value = ''
  successMessage.value = ''

  if (!email.value) {
    error.value = 'Email is required'
    return
  }

  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address'
    return
  }

  loading.value = true

  try {
    await authStore.resetPassword(email.value)
    successMessage.value = 'A password reset link has been sent to your email.'
    email.value = ''
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to send reset link. Please try again.'
    error.value = errorMessage
    console.error('Password reset request error: ', err)
  } finally {
    loading.value = false
  }
}
</script>
