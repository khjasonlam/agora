<script setup lang="ts">
defineProps<{
  open: boolean
  title?: string
  description?: string
  loading?: boolean
}>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #content>
      <UCard>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <div class="rounded-full bg-red-500/10 p-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="size-5 text-red-500" />
            </div>
            <div>
              <h3 class="font-semibold text-lg">{{ title ?? '削除の確認' }}</h3>
              <p class="text-sm text-muted mt-1">{{ description ?? 'この操作は取り消せません。本当に削除しますか？' }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="emit('update:open', false)">キャンセル</UButton>
            <UButton color="error" :loading="loading" @click="emit('confirm')">削除する</UButton>
          </div>
        </div>
      </UCard>
    </template>
  </UModal>
</template>
