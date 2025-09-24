<template>
  <div class="max-w-md mx-auto card-design">
    <h2 class="text-2xl font-bold text-center mb-4">Update Password</h2>

    <form @submit.prevent="handlePasswordUpdate" class="space-y-4">
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1"
          >New Password</label
        >
        <Password
          id="password"
          v-model="password"
          placeholder="Enter your new password"
          toggleMask
          class="w-full"
          :class="{ 'p-invalid': errorMessage || (submitted && !password) }"
          :feedback="true"
        />
        <small v-if="submitted && !password" class="text-red-500">Password is required</small>
        <small v-else-if="submitted && password.length < 6" class="text-red-500">
          Password must be at least 6 characters
        </small>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1"
          >Confirm Password</label
        >
        <Password
          id="confirmPassword"
          v-model="confirmPassword"
          placeholder="Confirm your new password"
          :feedback="false"
          toggleMask
          class="w-full"
          :class="{ 'p-invalid': errorMessage || (submitted && password !== confirmPassword) }"
        />
        <small v-if="submitted && password !== confirmPassword" class="text-red-500">
          Passwords do not match
        </small>
      </div>

      <Button label="Update Password" class="w-full" :loading="loading" />

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { Password, Button } from 'primevue'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  // Check if we have a valid session (user clicked the reset link)
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
      router.push('/login')
    }
  })
})

const handlePasswordUpdate = async () => {
  submitted.value = true
  errorMessage.value = ''
  successMessage.value = ''

  // Validation
  if (!password.value) {
    errorMessage.value = 'Password is required'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value,
    })

    if (error) throw error

    successMessage.value = 'Password updated successfully! Redirecting to login...'

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage.value = (error as { message?: string }).message || 'Failed to update password'
    } else {
      errorMessage.value = 'Failed to update password'
    }
  } finally {
    loading.value = false
  }
}
</script>
