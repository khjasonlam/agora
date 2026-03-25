<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">管理ダッシュボード</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink to="/admin/users">
        <UCard class="hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-users" class="size-6 text-primary" />
            <div>
              <p class="font-medium">ユーザー管理</p>
              <p class="text-sm text-muted">ユーザーの一覧・削除</p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
      <NuxtLink to="/admin/categories">
        <UCard class="hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-tag" class="size-6 text-primary" />
            <div>
              <p class="font-medium">カテゴリ管理</p>
              <p class="text-sm text-muted">カテゴリの作成・編集・削除</p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
