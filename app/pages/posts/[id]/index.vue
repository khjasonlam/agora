<script setup lang="ts">
interface PostDetailResponse {
  success: boolean
  data: {
    id: number
    title: string
    category_id: number
    created_at: string
    profiles: { name: string } | null
    categories: { name: string; icon: string } | null
  } | null
  error: string | null
}

const route = useRoute()
const postId = Number(route.params.id)

const { data: postData } = await useApiFetch<PostDetailResponse>(`/api/posts/${postId}`)
const post = computed(() => postData.value?.data)

const { threads: initialThreads } = useThreads(postId)
const { newThreads } = useRealtime(postId)

const allThreads = computed(() => [...initialThreads.value, ...newThreads.value])

const backLink = computed(() => {
  const catId = post.value?.category_id
  return catId ? `/categories/${catId}` : '/'
})
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
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

    <ThreadList :threads="allThreads" class="mb-6" />

    <ThreadForm :post-id="postId" />
  </div>
</template>
