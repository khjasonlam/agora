<script setup lang="ts">
const route = useRoute()
const postId = Number(route.params.id)

const { data: postData } = await useFetch(`/api/posts/${postId}`)
const { data: threadsData } = await useFetch(`/api/threads?postId=${postId}`)

const post = computed(() => postData.value?.data)
const initialThreads = computed(() => threadsData.value?.data ?? [])

// Realtime で新着スレッドを受信
const { newThreads } = useRealtime(postId)

const allThreads = computed(() => [...initialThreads.value, ...newThreads.value])
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div v-if="post" class="mb-6">
      <NuxtLink to="/" class="text-sm text-muted hover:underline flex items-center gap-1 mb-4">
        <UIcon name="i-heroicons-arrow-left" class="size-4" />
        カテゴリに戻る
      </NuxtLink>
      <h1 class="text-2xl font-bold">{{ post.title }}</h1>
      <p class="text-sm text-muted mt-1">
        {{ formatRelativeDate(post.created_at) }} · {{ post.profiles?.name }}
      </p>
    </div>

    <USeparator class="my-4" />

    <div class="space-y-4 mb-6">
      <ThreadItem
        v-for="thread in allThreads"
        :key="thread.id"
        :thread="thread"
      />
      <p v-if="allThreads.length === 0" class="text-muted text-center py-4">
        まだコメントがありません
      </p>
    </div>

    <ThreadForm :post-id="postId" />
  </div>
</template>
