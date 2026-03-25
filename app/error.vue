<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

const handleClearError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="text-center space-y-6 max-w-md">
      <div class="mx-auto rounded-full bg-red-500/10 p-4 w-fit">
        <UIcon name="i-heroicons-exclamation-triangle" class="size-10 text-red-500" />
      </div>

      <div class="space-y-2">
        <h1 class="text-4xl font-bold">{{ error.statusCode }}</h1>
        <p class="text-lg text-muted">
          {{ error.statusCode === 404 ? 'ページが見つかりません' : 'エラーが発生しました' }}
        </p>
        <p v-if="error.message && error.statusCode !== 404" class="text-sm text-muted">
          {{ error.message }}
        </p>
      </div>

      <UButton icon="i-heroicons-home" size="lg" @click="handleClearError">
        ホームに戻る
      </UButton>
    </div>
  </div>
</template>
