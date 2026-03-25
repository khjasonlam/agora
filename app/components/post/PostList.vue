<script setup lang="ts">
defineProps<{
  posts: {
    id: number
    title: string
    created_at: string
    profiles: { name: string } | null
    threads: { count: number }[]
  }[]
}>()
</script>

<template>
  <div class="space-y-3">
    <PostCard v-for="post in posts" :key="post.id" :post="post" />
    <p v-if="posts.length === 0" class="text-muted text-center py-8">
      まだ投稿がありません
    </p>
  </div>
</template>
