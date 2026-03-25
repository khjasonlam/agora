<script setup lang="ts">
const route = useRoute()
const categoryId = Number(route.params.id)

const { data: categoryData } = await useFetch(`/api/categories/${categoryId}`)
const { data: postsData, refresh } = await useFetch(`/api/posts?categoryId=${categoryId}`)

const category = computed(() => categoryData.value?.data)
const posts = computed(() => postsData.value?.data ?? [])

const showForm = ref(false)

async function onPostCreated() {
  showForm.value = false
  await refresh()
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <UIcon v-if="category" :name="category.icon" class="size-6 text-primary" />
        <h1 class="text-2xl font-bold">{{ category?.name }}</h1>
      </div>
      <UButton icon="i-heroicons-plus" @click="showForm = !showForm">
        新規投稿
      </UButton>
    </div>

    <PostForm
      v-if="showForm"
      :category-id="categoryId"
      class="mb-6"
      @created="onPostCreated"
      @cancel="showForm = false"
    />

    <div class="space-y-3">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
      <p v-if="posts.length === 0" class="text-muted text-center py-8">
        まだ投稿がありません
      </p>
    </div>
  </div>
</template>
