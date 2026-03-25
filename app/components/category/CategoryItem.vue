<script setup lang="ts">
defineProps<{
  category: {
    id: number
    name: string
    icon: string
  }
}>()
</script>

<template>
  <NuxtLink :to="`/categories/${category.id}`">
    <UCard class="hover:shadow-md transition-shadow cursor-pointer">
      <div class="flex items-center gap-3">
        <UIcon :name="category.icon" class="size-6 text-primary" />
        <span class="font-medium">{{ category.name }}</span>
      </div>
    </UCard>
  </NuxtLink>
</template>
