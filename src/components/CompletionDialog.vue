<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Congratulations!"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="flex flex-col items-center text-center">
      <i class="pi pi-trophy text-6xl text-yellow-500 mb-4"></i>
      <h3 class="text-2xl font-bold mb-2">You've finished reading!</h3>
      <p class="text-lg mb-4">
        Congratulations on completeting <strong>"{{ bookTitle }}"</strong>!
      </p>
      <p class="text-gray-600 mb-6">You read {{ props.bookPages }} pages. Great job!</p>
      <Button label="Awesome!" icon="pi pi-check" @click="closeDialog" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, Button } from 'primevue'

interface Props {
  show: boolean
  bookTitle: string
  bookPages?: number | null | undefined
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)

watch(
  () => props.show,
  (newValue) => {
    visible.value = newValue
  },
)

watch(visible, (newValue) => {
  emit('update:show', newValue)
  if (!newValue) {
    emit('close')
  }
})

const closeDialog = () => {
  visible.value = false
}
</script>
