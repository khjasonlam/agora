<script setup lang="ts">
const props = defineProps<{ postId: number }>()
const notify = useNotificationStore()
const loading = ref(false)
const content = ref('')

const submit = async () => {
  if (!content.value.trim()) return

  loading.value = true
  try {
    await $fetch('/api/threads', {
      method: 'POST',
      body: { post_id: props.postId, content: content.value.trim() }
    })
  } catch {
    loading.value = false
    notify.error('コメントの投稿に失敗しました')
    return
  }
  loading.value = false
  content.value = ''
}
</script>

<template>
  <UCard>
    <template #header>
      <p class="text-sm font-medium">コメントを投稿</p>
    </template>
    <UForm :state="{ content }" @submit.prevent="submit">
      <UTextarea
        v-model="content"
        placeholder="コメントを入力..."
        :rows="3"
        autoresize
        class="w-full"
      />
      <div class="flex items-center justify-between mt-3">
        <p class="text-xs text-muted">Markdown は使用できません</p>
        <UButton type="submit" :loading="loading" :disabled="!content.trim()">
          コメントする
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>
