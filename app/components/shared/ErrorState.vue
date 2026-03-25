<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message?: string
  retryable?: boolean
}>(), {
  title: 'エラーが発生しました',
  message: 'データの取得に失敗しました。しばらくしてからもう一度お試しください。',
  retryable: true
})

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 gap-4">
    <div class="rounded-full bg-red-500/10 p-3">
      <UIcon name="i-heroicons-exclamation-triangle" class="size-6 text-red-500" />
    </div>
    <div class="text-center space-y-1">
      <p class="font-medium">{{ title }}</p>
      <p class="text-sm text-muted max-w-sm">{{ message }}</p>
    </div>
    <UButton
      v-if="retryable"
      variant="outline"
      color="neutral"
      icon="i-heroicons-arrow-path"
      @click="emit('retry')"
    >
      再読み込み
    </UButton>
  </div>
</template>
