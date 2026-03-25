<script setup lang="ts">
defineProps<{
  categories: {
    id: number
    name: string
    icon: string
  }[]
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <CategoryItem
      v-for="cat in categories"
      :key="cat.id"
      :category="cat"
    />
  </div>
</template>
