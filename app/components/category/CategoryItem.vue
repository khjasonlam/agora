<script setup lang="ts">
import type { Category } from '~/types'

defineProps<{ category: Category }>()
</script>

<template>
  <NuxtLink :to="`/categories/${category.id}`">
    <UCard class="hover:ring-primary/50 hover:ring-1 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer h-full">
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
          <UIcon :name="category.icon" class="size-5 text-primary" />
        </div>
        <span class="font-medium text-sm">{{ category.name }}</span>
      </div>
    </UCard>
  </NuxtLink>
</template>
