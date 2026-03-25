<script setup lang="ts">
interface CategoryResponse {
  success: boolean
  data: { id: number; name: string; icon: string } | null
  error: string | null
}

const route = useRoute()
const categoryId = Number(route.params.id)

const { data: categoryData } = await useApiFetch<CategoryResponse>(`/api/categories/${categoryId}`)
const category = computed(() => categoryData.value?.data)

const { posts, refresh } = usePosts(categoryId)

const showForm = ref(false)

const onPostCreated = async () => {
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

    <PostList :posts="posts" />
  </div>
</template>
