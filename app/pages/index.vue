<script setup lang="ts">
const { categories, status, error, refresh } = useCategories()
const authStore = useAuthStore()
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">
        <ClientOnly>
          おかえりなさい{{ authStore.profile?.name ? `、${authStore.profile.name}` : '' }}
          <template #fallback>おかえりなさい</template>
        </ClientOnly>
      </h1>
      <p class="text-muted text-sm mt-1">カテゴリを選んでディスカッションに参加しましょう</p>
    </div>

    <SharedLoadingSpinner v-if="status === 'pending'" text="カテゴリを読み込み中..." />
    <SharedErrorState v-else-if="error" message="カテゴリの取得に失敗しました。" @retry="refresh()" />
    <template v-else-if="categories.length > 0">
      <CategoryList :categories="categories" />
    </template>
    <SharedEmptyState
      v-else
      icon="i-heroicons-folder-open"
      title="カテゴリがありません"
      description="管理者がカテゴリを作成するまでお待ちください。"
    />
  </div>
</template>
