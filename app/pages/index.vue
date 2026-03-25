<script setup lang="ts">
const { categories, status, error, refresh } = useCategories()
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">カテゴリ一覧</h1>

    <SharedLoadingSpinner v-if="status === 'pending'" text="カテゴリを読み込み中..." />
    <SharedErrorState v-else-if="error" message="カテゴリの取得に失敗しました。" @retry="refresh()" />
    <CategoryList v-else :categories="categories" />
  </div>
</template>
