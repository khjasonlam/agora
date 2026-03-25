<script setup lang="ts">
defineProps<{
  thread: {
    id: number
    thread_number: number
    content: string
    created_at: string
    profiles: { name: string } | null
  }
}>()
</script>

<template>
  <div class="flex gap-3">
    <div class="text-sm text-muted w-8 shrink-0 pt-1 text-right">
      {{ thread.thread_number }}
    </div>
    <UCard class="flex-1">
      <div class="flex items-center gap-2 mb-2">
        <UIcon name="i-heroicons-user-circle" class="size-5 text-muted" />
        <span class="text-sm font-medium">{{ thread.profiles?.name ?? '匿名' }}</span>
        <span class="text-xs text-muted ml-auto">{{ formatRelativeDate(thread.created_at) }}</span>
      </div>
      <p class="text-sm whitespace-pre-wrap">{{ thread.content }}</p>
    </UCard>
  </div>
</template>
