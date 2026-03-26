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
  <div class="h-full flex flex-col">
    <SharedLoadingSpinner v-if="categoryStatus === 'pending'" text="カテゴリを読み込み中..." />
    <SharedErrorState v-else-if="categoryError" message="カテゴリの取得に失敗しました。" @retry="refreshCategory()" />
    <template v-else>
      <div class="shrink-0 border-b border-default">
        <div class="px-6 py-4 max-w-4xl mx-auto">
          <NuxtLink to="/" class="text-sm text-muted hover:underline inline-flex items-center gap-1 mb-4">
            <UIcon name="i-heroicons-arrow-left" class="size-3.5" />
            ホーム
          </NuxtLink>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div v-if="category" class="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
                <UIcon :name="category.icon" class="size-5 text-primary" />
              </div>
              <h1 class="text-2xl font-bold">{{ category?.name }}</h1>
            </div>
            <UButton icon="i-heroicons-plus" @click="showForm = !showForm">
              新規投稿
            </UButton>
          </div>

          <PostForm
            v-if="showForm"
            :category-id="categoryId"
            class="mt-4"
            @created="onPostCreated"
            @cancel="showForm = false"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div class="px-6 py-4 max-w-4xl mx-auto">
          <SharedSkeletonPostList v-if="postsStatus === 'pending'" />
          <SharedErrorState v-else-if="postsError" message="投稿の取得に失敗しました。" @retry="refreshPosts()" />
          <PostList v-else :posts="posts" />
        </div>
      </div>
    </template>
  </div>
</template>
