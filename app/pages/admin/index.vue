<script setup lang="ts">
import type { Profile, ApiResponse } from '~/types'

definePageMeta({ middleware: 'admin' })

const [
  { data: activityData },
  { data: categoryStatsData },
  { data: userStatsData },
  { data: usersData }
] = await Promise.all([
  useFetch<{ success: boolean, data: { date: string, posts: number, threads: number }[], error: null }>('/api/admin/stats/activity'),
  useFetch<{ success: boolean, data: { name: string, count: number }[], error: null }>('/api/admin/stats/categories'),
  useFetch<{ success: boolean, data: { name: string, total: number, posts: number, threads: number }[], error: null }>('/api/admin/stats/users'),
  useFetch<ApiResponse<Profile[]>>('/api/admin/users')
])

const stats = computed(() => [
  {
    label: 'ユーザー',
    value: usersData.value?.data?.length ?? 0,
    icon: 'i-heroicons-users'
  },
  {
    label: 'カテゴリ',
    value: categoryStatsData.value?.data?.length ?? 0,
    icon: 'i-heroicons-tag'
  },
  {
    label: '投稿',
    value: categoryStatsData.value?.data?.reduce((sum, c) => sum + c.count, 0) ?? 0,
    icon: 'i-heroicons-document-text'
  }
])
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">管理ダッシュボード</h1>
      <p class="text-muted text-sm mt-1">フォーラムの管理操作を行えます</p>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-8">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
            <UIcon :name="stat.icon" class="size-5 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-bold">{{ stat.value }}</p>
            <p class="text-xs text-muted">{{ stat.label }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <UCard class="mb-8">
      <template #header>
        <p class="text-sm font-medium">アクティビティ（過去30日）</p>
      </template>
      <ClientOnly>
        <div class="h-56">
          <AdminActivityChart v-if="activityData?.data" :data="activityData.data" />
        </div>
        <template #fallback>
          <div class="h-56 flex items-center justify-center">
            <SharedLoadingSpinner />
          </div>
        </template>
      </ClientOnly>
    </UCard>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <UCard>
        <template #header>
          <p class="text-sm font-medium">カテゴリ別投稿数</p>
        </template>
        <ClientOnly>
          <div :style="`height: ${Math.max(160, (categoryStatsData?.data?.length ?? 0) * 36)}px`">
            <AdminCategoryChart v-if="categoryStatsData?.data?.length" :data="categoryStatsData.data" />
            <SharedEmptyState v-else icon="i-heroicons-tag" title="データがありません" />
          </div>
          <template #fallback>
            <div class="h-40 flex items-center justify-center">
              <SharedLoadingSpinner />
            </div>
          </template>
        </ClientOnly>
      </UCard>

      <UCard>
        <template #header>
          <p class="text-sm font-medium">アクティブユーザー TOP 10</p>
        </template>
        <ClientOnly>
          <div :style="`height: ${Math.max(160, (userStatsData?.data?.length ?? 0) * 36)}px`">
            <AdminUserChart v-if="userStatsData?.data?.length" :data="userStatsData.data" />
            <SharedEmptyState v-else icon="i-heroicons-users" title="データがありません" />
          </div>
          <template #fallback>
            <div class="h-40 flex items-center justify-center">
              <SharedLoadingSpinner />
            </div>
          </template>
        </ClientOnly>
      </UCard>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink to="/admin/users">
        <UCard class="hover:ring-primary/50 hover:ring-1 hover:shadow-md transition-all cursor-pointer h-full">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center size-12 rounded-lg bg-primary/10 shrink-0">
              <UIcon name="i-heroicons-users" class="size-6 text-primary" />
            </div>
            <div>
              <p class="font-medium">ユーザー管理</p>
              <p class="text-sm text-muted mt-0.5">ユーザーの作成・編集・削除</p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
      <NuxtLink to="/admin/categories">
        <UCard class="hover:ring-primary/50 hover:ring-1 hover:shadow-md transition-all cursor-pointer h-full">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center size-12 rounded-lg bg-primary/10 shrink-0">
              <UIcon name="i-heroicons-tag" class="size-6 text-primary" />
            </div>
            <div>
              <p class="font-medium">カテゴリ管理</p>
              <p class="text-sm text-muted mt-0.5">カテゴリの作成・編集・削除</p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
