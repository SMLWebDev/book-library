<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <PasswordResetForm @back-to-login="navigateToLogin" @reset-complete="handleResetComplete" />
  </div>
</template>

<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation.ts'
import PasswordResetForm from '@/components/auth/PasswordResetForm.vue'

const { navigateToLogin } = useNavigation()

const handleResetComplete = () => {
  console.log('Password reset completed successfully')
}
</script>
