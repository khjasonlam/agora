<script setup lang="ts">
const { categories } = useCategories()
const authStore = useAuthStore()
</script>

<template>
  <div class="space-y-1">
    <NuxtLink
      to="/"
      class="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-elevated transition-colors"
      active-class="bg-elevated font-medium"
    >
      <UIcon name="i-heroicons-home" class="size-4" />
      ホーム
    </NuxtLink>

    <div class="pt-2 pb-1 px-3 text-xs font-semibold text-muted uppercase tracking-wider">
      カテゴリ
    </div>

    <NuxtLink
      v-for="cat in categories"
      :key="cat.id"
      :to="`/categories/${cat.id}`"
      class="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-elevated transition-colors"
      active-class="bg-elevated font-medium"
    >
      <UIcon :name="cat.icon" class="size-4 text-primary" />
      {{ cat.name }}
    </NuxtLink>

    <template v-if="authStore.isAdmin">
      <div class="pt-2 pb-1 px-3 text-xs font-semibold text-muted uppercase tracking-wider">
        管理者
      </div>
      <NuxtLink
        to="/admin"
        class="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-elevated transition-colors"
        active-class="bg-elevated font-medium"
      >
        <UIcon name="i-heroicons-cog-6-tooth" class="size-4" />
        管理ダッシュボード
      </NuxtLink>
    </template>
  </div>
</template>
