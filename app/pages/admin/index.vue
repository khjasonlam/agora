<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">管理ダッシュボード</h1>
      <p class="text-muted text-sm mt-1">フォーラムの管理操作を行えます</p>
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
