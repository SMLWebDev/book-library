<template>
  <div class="library-filters flex flex-wrap gap-4 items-center">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
      <SelectButton
        v-model="status"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
      <Dropdown
        v-model="sort"
        :options="sortOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Sort By"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// import { ref, watch } from 'vue'
import { SelectButton, Dropdown } from 'primevue'

const status = defineModel<'all' | 'read' | 'to-read' | 'reading'>('status', { default: 'all' })
const sort = defineModel<'date-added' | 'title' | 'author'>('sort', { default: 'date-added' })

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'To Read', value: 'to-read' },
  { label: 'Reading', value: 'reading' },
  { label: 'Read', value: 'read' },
]

const sortOptions = [
  { label: 'Date Added', value: 'date-added' },
  { label: 'Title', value: 'title' },
  { label: 'Author', value: 'author' },
]
</script>
