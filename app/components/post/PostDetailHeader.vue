<script setup lang="ts">
import type { Post } from '~/types'

defineProps<{
  post: Post | null
  backLink: string
  backLabel: string
}>()
</script>

<template>
  <div class="shrink-0 border-b border-default">
    <div class="px-6 py-4 max-w-3xl mx-auto">
      <UBreadcrumb
        :items="[
          { label: 'ホーム', to: '/', icon: 'i-heroicons-home' },
          { label: backLabel, to: backLink },
          { label: post?.title ?? '' }
        ]"
        class="mb-3"
      />

      <div v-if="post">
        <h1 class="text-lg sm:text-xl font-bold line-clamp-2">{{ post.title }}</h1>
        <div class="flex items-center gap-2 mt-2 text-sm text-muted">
          <div class="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            {{ post.profiles?.name?.charAt(0) ?? '?' }}
          </div>
          <span>{{ post.profiles?.name ?? '匿名' }}</span>
          <span class="text-muted/40">·</span>
          <span>{{ formatRelativeDate(post.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
