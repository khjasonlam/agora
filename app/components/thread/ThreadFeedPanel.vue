<script setup lang="ts">
import type { Thread } from '~/types'

defineProps<{
  allThreads: Thread[]
  threadsStatus: string
  threadsError: unknown
  realtimeStatus: string
  connectionError: string | null
  onRefreshThreads: () => void
  onReconnect: () => void
}>()
</script>

<template>
  <div class="px-6 py-4 max-w-3xl mx-auto">
    <UAlert
      v-if="connectionError"
      color="error"
      variant="subtle"
      icon="i-heroicons-exclamation-triangle"
      :description="connectionError"
      class="mb-4"
    >
      <template #actions>
        <UButton size="xs" variant="outline" color="error" @click="onReconnect">
          再接続
        </UButton>
      </template>
    </UAlert>

    <div class="flex items-center gap-2 mb-4">
      <h2 class="text-sm font-semibold text-muted uppercase tracking-wider">コメント</h2>
      <UBadge v-if="allThreads.length > 0" variant="subtle" color="neutral" size="xs">
        {{ allThreads.length }}
      </UBadge>
    </div>

    <SharedSkeletonThreadList v-if="threadsStatus === 'pending' || realtimeStatus === 'connecting'" />
    <SharedErrorState
      v-else-if="threadsError"
      message="コメントの取得に失敗しました。"
      @retry="onRefreshThreads"
    />
    <ThreadList v-else :threads="allThreads" />
  </div>
</template>
