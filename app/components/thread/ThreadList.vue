<script setup lang="ts">
import type { Thread } from '~/types'

defineProps<{ threads: Thread[] }>()
</script>

<template>
  <div class="space-y-4">
    <ThreadItem
      v-for="thread in threads"
      :key="thread.id"
      :thread="thread"
    />
    <p v-if="threads.length === 0" class="text-muted text-center py-4">
      まだコメントがありません
    </p>
  </div>
</template>
