<script setup lang="ts">
import type { Thread } from '~/types'

defineProps<{ threads: Thread[] }>()
</script>

<template>
  <div>
    <TransitionGroup v-if="threads.length > 0" name="thread" tag="div">
      <ThreadItem
        v-for="thread in threads"
        :key="thread.id"
        :thread="thread"
      />
    </TransitionGroup>
    <SharedEmptyState
      v-else
      icon="i-heroicons-chat-bubble-bottom-center-text"
      title="まだコメントがありません"
      description="最初のコメントを投稿してみましょう。"
    />
  </div>
</template>
