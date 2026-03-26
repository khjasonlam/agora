<script setup lang="ts">
defineProps<{
  postId: number
}>()
</script>

<template>
  <div class="shrink-0 border-t border-default">
    <div class="px-6 py-4 max-w-3xl mx-auto">
      <ThreadForm :post-id="postId" />
    </div>
  </div>
</template>
