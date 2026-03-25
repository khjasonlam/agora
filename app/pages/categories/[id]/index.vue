<script setup lang="ts">
import type { Category, ApiResponse } from '~/types'

const route = useRoute()
const categoryId = Number(route.params.id)

const { data: categoryData, status: categoryStatus, error: categoryError, refresh: refreshCategory } = await useFetch<ApiResponse<Category>>(`/api/categories/${categoryId}`)
const category = computed(() => categoryData.value?.data)

const { posts, status: postsStatus, error: postsError, refresh: refreshPosts } = usePosts(categoryId)

const showForm = ref(false)

const onPostCreated = async () => {
  showForm.value = false
  await refreshPosts()
}
</script>

<template>
  <div class="p-6">
    <SharedLoadingSpinner v-if="categoryStatus === 'pending'" text="カテゴリを読み込み中..." />
    <SharedErrorState v-else-if="categoryError" message="カテゴリの取得に失敗しました。" @retry="refreshCategory()" />
    <template v-else>
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

      <SharedLoadingSpinner v-if="postsStatus === 'pending'" text="投稿を読み込み中..." />
      <SharedErrorState v-else-if="postsError" message="投稿の取得に失敗しました。" @retry="refreshPosts()" />
      <PostList v-else :posts="posts" />
    </template>
  </div>
</template>
