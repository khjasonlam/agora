<script setup lang="ts">
const { data } = await useFetch('/api/categories')
const categories = computed(() => data.value?.data ?? [])
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">カテゴリ一覧</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.id"
        :to="`/categories/${cat.id}`"
      >
        <UCard class="hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center gap-3">
            <UIcon :name="cat.icon" class="size-6 text-primary" />
            <span class="font-medium">{{ cat.name }}</span>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
