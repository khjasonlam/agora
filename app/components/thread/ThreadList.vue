<script setup lang="ts">
import type { Thread } from '~/types'

defineProps<{ threads: Thread[] }>()
</script>

<template>
  <div>
    <div v-if="threads.length > 0" class="space-y-0">
      <ThreadItem
        v-for="thread in threads"
        :key="thread.id"
        :thread="thread"
      />
    </div>
    <SharedEmptyState
      v-else
      icon="i-heroicons-chat-bubble-bottom-center-text"
      title="まだコメントがありません"
      description="最初のコメントを投稿してみましょう。"
    />
  </div>
</template>
