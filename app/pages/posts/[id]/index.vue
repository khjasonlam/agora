<script setup lang="ts">
import { usePostDetail } from '~/composables/usePostDetail'

const route = useRoute()
const postId = Number(route.params.id)

const {
  post,
  postStatus,
  postError,
  refreshPost,
  threadsStatus,
  threadsError,
  refreshThreads,
  newThreads,
  realtimeStatus,
  connectionError,
  reconnect,
  allThreads,
  backLink,
  backLabel
} = usePostDetail(postId)

const { scrollContainer } = useThreadAutoScroll({ realtimeStatus, newThreads })
</script>

<template>
  <div class="h-full flex flex-col">
    <SharedLoadingSpinner v-if="postStatus === 'pending'" text="投稿を読み込み中..." />
    <SharedErrorState v-else-if="postError" message="投稿の取得に失敗しました。" @retry="refreshPost()" />
    <template v-else>
      <PostDetailHeader v-if="post" :post="post" :back-link="backLink" :back-label="backLabel" />

      <!-- Scrollable threads body -->
      <div ref="scrollContainer" class="flex-1 overflow-y-auto">
        <ThreadFeedPanel
          :all-threads="allThreads"
          :threads-status="threadsStatus"
          :threads-error="threadsError"
          :realtime-status="realtimeStatus"
          :connection-error="connectionError"
          :on-refresh-threads="() => refreshThreads()"
          :on-reconnect="reconnect"
        />
      </div>

      <!-- Fixed footer: comment form -->
      <ThreadComposerDock :post-id="postId" />
    </template>
  </div>
</template>
