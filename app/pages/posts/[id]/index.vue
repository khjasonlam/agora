<script setup lang="ts">
import { usePostDetail } from '~/composables/usePostDetail'

const route = useRoute()
const postId = Number(route.params.id)

const { post, threads, realtime, nav } = await usePostDetail(postId)
const { scrollContainer } = useThreadAutoScroll({ realtimeStatus: realtime.status, newThreads: threads.newThreads })

const postValue = computed(() => post.value.value)
const postStatus = computed(() => post.status.value)
const postError = computed(() => post.error.value)
const allThreads = computed(() => threads.allThreads.value)
const threadsStatus = computed(() => threads.status.value)
const threadsError = computed(() => threads.error.value)
const realtimeStatus = computed(() => realtime.status.value)
const connectionError = computed(() => realtime.connectionError.value)
const backLink = computed(() => nav.backLink.value)
const backLabel = computed(() => nav.backLabel.value)
</script>

<template>
  <div class="h-full flex flex-col">
    <SharedLoadingSpinner v-if="postStatus === 'pending'" text="投稿を読み込み中..." />
    <SharedErrorState v-else-if="postError" message="投稿の取得に失敗しました。" @retry="post.refresh()" />
    <template v-else>
      <PostDetailHeader v-if="postValue" :post="postValue" :back-link="backLink" :back-label="backLabel" />

      <!-- Scrollable threads body -->
      <div ref="scrollContainer" class="flex-1 overflow-y-auto">
        <ThreadFeedPanel
          :all-threads="allThreads"
          :threads-status="threadsStatus"
          :threads-error="threadsError"
          :realtime-status="realtimeStatus"
          :connection-error="connectionError"
          :on-refresh-threads="() => threads.refresh()"
          :on-reconnect="realtime.reconnect"
        />
      </div>

      <!-- Fixed footer: comment form -->
      <ThreadComposerDock :post-id="postId" />
    </template>
  </div>
</template>
