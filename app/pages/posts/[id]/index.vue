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
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <SharedLoadingSpinner v-if="postStatus === 'pending'" text="投稿を読み込み中..." />
    <SharedErrorState v-else-if="postError" message="投稿の取得に失敗しました。" @retry="refreshPost()" />
    <template v-else>
      <div v-if="post" class="mb-6">
        <NuxtLink :to="backLink" class="text-sm text-muted hover:underline flex items-center gap-1 mb-4">
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          カテゴリに戻る
        </NuxtLink>
        <h1 class="text-2xl font-bold">{{ post.title }}</h1>
        <p class="text-sm text-muted mt-1">
          {{ formatRelativeDate(post.created_at) }} · {{ post.profiles?.name }}
        </p>
      </div>

      <USeparator class="my-4" />

      <div
        v-if="connectionError"
        class="mb-4 flex items-center justify-between gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="size-5 text-red-500 shrink-0" />
          <span>{{ connectionError }}</span>
        </div>
        <UButton size="xs" variant="outline" color="error" @click="reconnect">
          再接続
        </UButton>
      </div>

      <div
        v-else-if="realtimeStatus === 'connecting'"
        class="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm"
      >
        <UIcon name="i-heroicons-arrow-path" class="size-4 animate-spin text-yellow-500" />
        <span>リアルタイム接続中...</span>
      </div>

      <SharedLoadingSpinner v-if="threadsStatus === 'pending'" text="コメントを読み込み中..." />
      <SharedErrorState v-else-if="threadsError" message="コメントの取得に失敗しました。" @retry="refreshThreads()" />
      <template v-else>
        <ThreadList :threads="allThreads" class="mb-6" />
        <ThreadForm :post-id="postId" />
      </template>
    </template>
  </div>
</template>
