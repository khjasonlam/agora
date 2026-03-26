<script setup lang="ts">
import type { Thread } from '~/types'

defineProps<{ thread: Thread }>()
</script>

<template>
  <div class="flex gap-3">
    <div class="flex flex-col items-center shrink-0">
      <div class="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary text-xs font-bold">
        {{ thread.profiles?.name?.charAt(0) ?? '?' }}
      </div>
      <div class="w-px flex-1 bg-primary/20 mt-2" />
    </div>
    <div class="flex-1 pb-6 min-w-0">
      <div class="flex items-baseline gap-2 mb-1">
        <span class="text-sm font-medium">{{ thread.profiles?.name ?? '匿名' }}</span>
        <UBadge variant="subtle" color="primary" size="xs">
          #{{ thread.thread_number }}
        </UBadge>
        <span class="text-xs text-muted ml-auto shrink-0">{{ formatRelativeDate(thread.created_at) }}</span>
      </div>
      <p class="text-sm whitespace-pre-wrap leading-relaxed wrap-break-word">{{ thread.content }}</p>
    </div>
  </div>
</template>
