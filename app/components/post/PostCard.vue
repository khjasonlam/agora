<script setup lang="ts">
import type { Post } from '~/types'

defineProps<{ post: Post }>()
</script>

<template>
  <NuxtLink :to="`/posts/${post.id}`">
    <UCard class="hover:shadow-md transition-shadow cursor-pointer">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h3 class="font-medium truncate">{{ post.title }}</h3>
          <p class="text-sm text-muted mt-1">
            {{ formatRelativeDate(post.created_at) }}
          </p>
        </div>
        <div class="flex items-center gap-1 text-sm text-muted shrink-0">
          <UIcon name="i-heroicons-chat-bubble-left" class="size-4" />
          {{ post.threads?.[0]?.count ?? 0 }}
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
