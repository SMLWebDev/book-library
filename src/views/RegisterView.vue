<template>
  <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
    <h1 class="text-2xl font-bold text-center mb-6">Create Account</h1>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <InputText
          id="name"
          v-model="form.name"
          placeholder="Enter your name"
          class="w-full"
          :class="{ 'p-invalid': errors.name }"
        />
        <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
      </div>
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <InputText
          id="email"
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          class="w-full"
          :class="{ 'p-invalid': errors.email }"
        />
        <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <Password
          id="password"
          v-model="form.password"
          placeholder="Enter your password"
          toggleMask
          class="w-full"
          :class="{ 'p-invalid': errors.password }"
        />
        <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1"
          >Confirm Password</label
        >
        <Password
          id="confirmPassword"
          v-model="form.confirmPassword"
          placeholder="Confirm your password"
          :feedback="false"
          toggleMask
          class="w-full"
          :class="{ 'p-invalid': errors.confirmPassword }"
        />
        <small v-if="errors.confirmPassword" class="text-red-500">{{
          errors.confirmPassword
        }}</small>
      </div>

      <Button type="submit" label="Create Account" class="w-full" :loading="loading" />

      <div v-if="errorMessage" class="p-3 bg-red-100 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="p-3 bg-green-100 text-green-700 rounded-md">
        {{ successMessage }}
      </div>
    </form>

    <div class="mt-6 text-center">
      <p class="text-gray-600">
        Already have an account?
        <router-link to="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">
          Sign in here
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
// import { useAuthStore } from '@/stores/auth'
import { InputText, Button, Password } from 'primevue'
import { supabase } from '@/api/supabase'

const router = useRouter()
// const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validateForm = () => {
  let isValid = true
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!form.name) {
    errors.name = 'Name is required'
    isValid = false
  }

  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
        },
      },
    })

    if (error) throw error

    successMessage.value =
      'Account created successfully! Please check your email to verify your account.'

    // Clear form
    form.name = ''
    form.email = ''
    form.password = ''
    form.confirmPassword = ''

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage.value = (error as { message?: string }).message || 'Failed to create account'
    } else {
      errorMessage.value = 'Failed to create account'
    }
  } finally {
    loading.value = false
  }
}
</script>
