<script setup lang="ts">
import type { Post } from '~/types'

defineProps<{ post: Post }>()
</script>

<template>
  <NuxtLink :to="`/posts/${post.id}`">
    <UCard class="hover:ring-primary/50 hover:ring-1 hover:shadow-md transition-all cursor-pointer">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <h3 class="font-medium truncate">{{ post.title }}</h3>
          <div class="flex items-center gap-2 mt-1.5 text-xs text-muted">
            <span>{{ post.profiles?.name ?? '匿名' }}</span>
            <span class="text-muted/40">·</span>
            <span>{{ formatRelativeDate(post.created_at) }}</span>
          </div>
        </div>
        <UBadge variant="subtle" color="neutral" size="sm" class="shrink-0">
          <UIcon name="i-heroicons-chat-bubble-left" class="size-3.5 mr-1" />
          {{ post.threads?.[0]?.count ?? 0 }}
        </UBadge>
      </div>
    </UCard>
  </NuxtLink>
</template>
