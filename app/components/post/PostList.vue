<script setup lang="ts">
import type { Post } from '~/types'

defineProps<{ posts: Post[] }>()
const emit = defineEmits<{ 'new-post': [] }>()
</script>

<template>
  <div class="space-y-3">
    <PostCard v-for="post in posts" :key="post.id" :post="post" />
    <SharedEmptyState
      v-if="posts.length === 0"
      icon="i-heroicons-document-text"
      title="まだ投稿がありません"
      description="最初の投稿を作成してディスカッションを始めましょう。"
    >
      <UButton icon="i-heroicons-plus" size="sm" @click="emit('new-post')">
        最初の投稿を作成
      </UButton>
    </SharedEmptyState>
  </div>
</template>
