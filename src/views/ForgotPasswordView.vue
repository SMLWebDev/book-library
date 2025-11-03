<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <PasswordResetRequest @back-to-login="navigateToLogin" />
  </div>
</template>

<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation.ts'
import PasswordResetRequest from '@/components/auth/PasswordResetRequest.vue'

const { navigateToLogin } = useNavigation()
</script>
