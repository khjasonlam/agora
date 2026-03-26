<script setup lang="ts">
import type { Post, ApiResponse } from '~/types'

const route = useRoute()
const postId = Number(route.params.id)

const { data: postData, status: postStatus, error: postError, refresh: refreshPost } = await useFetch<ApiResponse<Post>>(`/api/posts/${postId}`)
const post = computed(() => postData.value?.data)

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

const scrollContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

watch(realtimeStatus, (status) => {
  if (status === 'connected') scrollToBottom()
})

watch(() => newThreads.value.length, () => {
  scrollToBottom()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <SharedLoadingSpinner v-if="postStatus === 'pending'" text="投稿を読み込み中..." />
    <SharedErrorState v-else-if="postError" message="投稿の取得に失敗しました。" @retry="refreshPost()" />
    <template v-else>
      <!-- Fixed header: post title + meta -->
      <div class="shrink-0 border-b border-default">
        <div class="px-6 py-4 max-w-3xl mx-auto">
          <UBreadcrumb
            :items="[
              { label: 'ホーム', to: '/', icon: 'i-heroicons-home' },
              { label: backLabel, to: backLink },
              { label: post?.title ?? '' }
            ]"
            class="mb-3"
          />
          <div v-if="post">
            <h1 class="text-lg sm:text-xl font-bold line-clamp-2">{{ post.title }}</h1>
            <div class="flex items-center gap-2 mt-2 text-sm text-muted">
              <div class="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {{ post.profiles?.name?.charAt(0) ?? '?' }}
              </div>
              <span>{{ post.profiles?.name ?? '匿名' }}</span>
              <span class="text-muted/40">·</span>
              <span>{{ formatRelativeDate(post.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

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
