<script setup lang="ts">
const { categories } = useCategories()
const authStore = useAuthStore()
const route = useRoute()
const activeCategoryId = useState<number | null>('activeCategoryId', () => null)

const isActive = (path: string) => route.path === path
const isCategoryActive = (catId: number) =>
  route.path === `/categories/${catId}` || activeCategoryId.value === catId
</script>

<template>
  <div class="space-y-1">
    <NuxtLink
      to="/"
      class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
      :class="isActive('/') ? 'bg-primary/10 text-primary font-medium' : 'text-muted hover:bg-elevated hover:text-default'"
    >
      <UIcon name="i-heroicons-home" class="size-4" />
      ホーム
    </NuxtLink>

    <USeparator class="my-3" />

    <div class="px-3 pb-1 text-xs font-semibold text-muted uppercase tracking-wider">
      カテゴリ
    </div>

    <template v-if="categories.length > 0">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.id"
        :to="`/categories/${cat.id}`"
        class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
        :class="isCategoryActive(cat.id) ? 'bg-primary/10 text-primary font-medium' : 'text-muted hover:bg-elevated hover:text-default'"
      >
        <UIcon :name="cat.icon" class="size-4" />
        <span class="truncate">{{ cat.name }}</span>
      </NuxtLink>
    </template>
    <p v-else class="px-3 py-2 text-xs text-muted">
      カテゴリがありません
    </p>

    <ClientOnly>
      <template v-if="authStore.isAdmin">
        <USeparator class="my-3" />

        <div class="px-3 pb-1 text-xs font-semibold text-muted uppercase tracking-wider">
          管理
        </div>

        <NuxtLink
          to="/admin"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="route.path.startsWith('/admin') ? 'bg-primary/10 text-primary font-medium' : 'text-muted hover:bg-elevated hover:text-default'"
        >
          <UIcon name="i-heroicons-shield-check" class="size-4" />
          管理ダッシュボード
        </NuxtLink>
      </template>
    </ClientOnly>
  </div>
</template>
