<template>
  <div class="card-design max-w-md mx-">
    <h2 class="text-2xl font-bold mb-6 test-">Create New Password</h2>
    <p class="text-gray-600 mb-6 t">Please enter your password below.</p>

    <form @submit.prevent="handlePasswordReset" class="space-y-4">
      <div class="field">
        <label for="new-password" class="block mb-2 font-medium">New Password</label>
        <Password
          id="new-password"
          v-model="password"
          placeholder="Enter your new password"
          class="w-full"
          :class="{ 'p-invalid': errors.password }"
          :feedback="true"
          toggleMask
          :inputProps="{
            autocomplete: 'new-password',
          }"
        />
        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
      </div>

      <div class="field">
        <label for="confirm-password" class="block mb-2 font-medium">Confirm Password</label>
        <Password
          id="confirm-password"
          v-model="confirmPassword"
          placeholder="Confirm your new password"
          class="w-full"
          :class="{ 'p-invalid': errors.confirmPassword }"
          :feedback="true"
          toggleMask
          :inputProps="{
            autocomplete: 'new-password',
          }"
        />
        <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
      </div>

      <Button
        type="submit"
        label="Reset Password"
        class="w-full"
        :loading="loading"
        :disabled="loading"
      />
    </form>

    <Message v-if="errorMessage" severity="success" class="mt-4">
      {{ successMessage }}
    </Message>

    <div class="text-center mt-4">
      <Button label="Back to Login" link @click="$emit('back-to-login')" :disabled="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'

import { Password, Button, Message } from 'primevue'

interface Emits {
  (e: 'back-to-login'): void
  (e: 'reset-complete'): void
}

const emit = defineEmits<Emits>()
// const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const errors = ref({
  password: '',
  confirmPassword: '',
})

const validatePassword = (password: string): boolean => {
  return password.length >= 8
}

const validateForm = (): boolean => {
  errors.value = { password: '', confirmPassword: '' }
  let isValid = true

  if (!password.value) {
    errors.value.password = 'Password is required'
    isValid = false
  } else if (!validatePassword(password.value)) {
    errors.value.password = 'Password must be at least 8 characters long'
    isValid = false
  }

  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const handlePasswordReset = async () => {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.resetPassword(password.value)
    successMessage.value =
      'Your password has been successfully reset. You can now log in with your new password.'

    setTimeout(() => {
      emit('reset-complete')
      emit('back-to-login')
    }, 2000)
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'An error occured. Please try again.'
    errorMessage.value = errMessage
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const accessToken = urlParams.get('access_token')
  const tokenType = urlParams.get('token_type')

  if (accessToken && tokenType) {
    try {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      })

      if (error) throw error
    } catch (error) {
      errorMessage.value = 'Invalid or expired reset link. Please request a new one.'
      console.error(error)
    }
  } else {
    errorMessage.value = 'Invalid reset link. Please request a new password reset.'
  }
})
</script>
