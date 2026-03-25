<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
}>(), {
  icon: 'i-heroicons-inbox',
  title: 'データがありません',
  description: ''
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 gap-4">
    <div class="rounded-full bg-muted/10 p-4">
      <UIcon :name="icon" class="size-8 text-muted" />
    </div>
    <div class="text-center space-y-1">
      <p class="font-medium text-muted">{{ title }}</p>
      <p v-if="description" class="text-sm text-muted/70 max-w-sm">{{ description }}</p>
    </div>
    <slot />
  </div>
</template>
