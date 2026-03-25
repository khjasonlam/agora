<script setup lang="ts">
withDefaults(defineProps<{
  text?: string
}>(), {
  text: '読み込み中...'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 gap-3">
    <UIcon name="i-heroicons-arrow-path" class="size-6 animate-spin text-primary" />
    <p class="text-sm text-muted">{{ text }}</p>
  </div>
</template>
