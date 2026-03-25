<script setup lang="ts">
const { categories } = useCategories()
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">カテゴリ一覧</h1>
    <CategoryList :categories="categories" />
  </div>
</template>
