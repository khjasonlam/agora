<script setup lang="ts">
import type { Post, ApiResponse, Thread } from '~/types'

const route = useRoute()
const postId = Number(route.params.id)

const { data: postData, status: postStatus, error: postError, refresh: refreshPost } = await useFetch<ApiResponse<Post>>(`/api/posts/${postId}`)
const post = computed(() => postData.value?.data ?? null)

const { threads: initialThreads, status: threadsStatus, error: threadsError, refresh: refreshThreads } = useThreads(postId)
const { newThreads, status: realtimeStatus, connectionError, reconnect } = useRealtime(postId)

const allThreads = computed<Thread[]>(() => [...initialThreads.value, ...newThreads.value])

const backLink = computed(() => {
  const catId = post.value?.category_id
  return catId ? `/categories/${catId}` : '/'
})

const backLabel = computed(() => {
  return post.value?.categories?.name ?? 'カテゴリに戻る'
})

const activeCategoryId = useState<number | null>('activeCategoryId', () => null)
watch(post, (p) => {
  activeCategoryId.value = p?.category_id ?? null
}, { immediate: true })
onUnmounted(() => {
  activeCategoryId.value = null
})
const { scrollContainer } = useThreadAutoScroll({ realtimeStatus, newThreads })
</script>

<template>
  <div class="h-full flex flex-col">
    <SharedLoadingSpinner v-if="postStatus === 'pending'" text="投稿を読み込み中..." />
    <SharedErrorState v-else-if="postError" message="投稿の取得に失敗しました。" @retry="refreshPost()" />
    <template v-else>
      <PostDetailHeader :post="post" :back-link="backLink" :back-label="backLabel" />

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
