<script setup lang="ts">
const props = defineProps<{ postId: number }>()
const notify = useNotificationStore()
const loading = ref(false)
const content = ref('')

async function submit() {
  if (!content.value.trim()) return

  loading.value = true
  const { error } = await useFetch('/api/threads', {
    method: 'POST',
    body: { post_id: props.postId, content: content.value.trim() }
  })
  loading.value = false

  if (error.value) {
    notify.error('コメントの投稿に失敗しました')
    return
  }

  content.value = ''
}
</script>

<template>
  <UCard>
    <UForm :state="{ content }" class="space-y-3" @submit="submit">
      <UFormField label="コメント" name="content">
        <UTextarea v-model="content" placeholder="コメントを入力..." :rows="3" class="w-full" />
      </UFormField>
      <div class="flex justify-end">
        <UButton type="submit" :loading="loading">
          コメントする
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>
