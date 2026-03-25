<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

const handleClearError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-default">
    <div class="text-center space-y-6 max-w-md">
      <p class="text-8xl font-bold text-muted/20">{{ error.statusCode }}</p>

      <div class="space-y-2">
        <h1 class="text-xl font-bold">
          {{ error.statusCode === 404 ? 'ページが見つかりません' : 'エラーが発生しました' }}
        </h1>
        <p class="text-sm text-muted">
          {{
            error.statusCode === 404
              ? 'お探しのページは存在しないか、移動した可能性があります。'
              : 'しばらくしてからもう一度お試しください。'
          }}
        </p>
        <p v-if="error.message && error.statusCode !== 404" class="text-xs text-muted/60 font-mono">
          {{ error.message }}
        </p>
      </div>

      <UButton icon="i-heroicons-home" variant="outline" color="neutral" @click="handleClearError">
        ホームに戻る
      </UButton>
    </div>
  </div>
</template>
