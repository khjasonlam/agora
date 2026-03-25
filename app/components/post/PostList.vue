<script setup lang="ts">
import type { Post } from '~/types'

defineProps<{ posts: Post[] }>()
</script>

<template>
  <div class="space-y-3">
    <PostCard v-for="post in posts" :key="post.id" :post="post" />
    <p v-if="posts.length === 0" class="text-muted text-center py-8">
      まだ投稿がありません
    </p>
  </div>
</template>
