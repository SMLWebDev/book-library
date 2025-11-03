<template>
  <div class="max-w-md mx-auto card-design">
    <h1 class="text-2xl font-bold text-center text-gray-600 mb-6">Sign In</h1>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label for="email" class="block text-ms font-medium text-gray-700 mb-1">Email</label>
        <InputText
          id="email"
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          class="w-full"
          :class="{ 'p-invalid': errors.email }"
          autocomplete="your-email"
          autocapitalize="off"
          spellcheck="false"
        />
        <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
      </div>

      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <Password
        id="password"
        v-model="form.password"
        placeholder="Enter your password"
        :feedback="false"
        toggleMask
        class="w-full"
        :class="{ 'p-invalid': errors.password }"
        :inputProps="{
          autocomplete: 'current-password',
          autocapitalize: 'off',
          spellcheck: 'false',
        }"
      />
      <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>

      <Button type="submit" label="Sign In" class="w-full" :loading="loading" />

      <div class="p-3 bg-red-100 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>
    </form>

    <div class="mt-6 text-center">
      <p class="text-gray-600">
        Don't have an account?
        <RouterLink to="/register" class="text-indigo-600 hover:text-indigo-500 font-medium">
          Sign up here
        </RouterLink>
      </p>
      <p class="text-gray-600">
        Forgot your password?
        <RouterLink to="/forgot-password" class="text-indigo-600 hover:text-indigo-500 font-medium">
          Reset it here
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { InputText, Button, Password } from 'primevue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: '',
})

onMounted(() => {
  setTimeout(() => {
    form.email = ''
    form.password = ''
  }, 100)
})

const errors = reactive({
  email: '',
  password: '',
})

const validateForm = () => {
  let isValid = true
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email is required.'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid.'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.signIn(form.email, form.password)
    router.push('/')
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage.value = (error as { message?: string }).message || 'Failed to sign in'
    } else {
      errorMessage.value = 'Failed to sign in'
    }
  } finally {
    loading.value = false
  }
}
</script>
