<script setup lang="ts">
import type { Post, ApiResponse } from '~/types'

const route = useRoute()
const postId = Number(route.params.id)

const { data: postData, status: postStatus, error: postError, refresh: refreshPost } = await useFetch<ApiResponse<Post>>(`/api/posts/${postId}`)
const post = computed(() => postData.value?.data ?? null)

const { threads: initialThreads, status: threadsStatus, error: threadsError, refresh: refreshThreads } = useThreads(postId)
const { newThreads, status: realtimeStatus, connectionError, reconnect } = useRealtime(postId)

const allThreads = computed(() => [...initialThreads.value, ...newThreads.value])

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
              <UButton size="xs" variant="outline" color="error" @click="reconnect">
                再接続
              </UButton>
            </template>
          </UAlert>

          <div class="flex items-center gap-2 mb-4">
            <h2 class="text-sm font-semibold text-muted uppercase tracking-wider">
              コメント
            </h2>
            <UBadge v-if="allThreads.length > 0" variant="subtle" color="neutral" size="xs">
              {{ allThreads.length }}
            </UBadge>
          </div>

          <SharedSkeletonThreadList v-if="threadsStatus === 'pending' || realtimeStatus === 'connecting'" />
          <SharedErrorState v-else-if="threadsError" message="コメントの取得に失敗しました。" @retry="refreshThreads()" />
          <ThreadList v-else :threads="allThreads" />
        </div>
      </div>

      <!-- Fixed footer: comment form -->
      <div class="shrink-0 border-t border-default">
        <div class="px-6 py-4 max-w-3xl mx-auto">
          <ThreadForm :post-id="postId" />
        </div>
      </div>
    </template>
  </div>
</template>
