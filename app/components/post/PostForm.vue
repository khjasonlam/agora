<script setup lang="ts">
const props = defineProps<{ categoryId: number }>()
const emit = defineEmits<{
  created: []
  cancel: []
}>()

const notify = useNotificationStore()
const loading = ref(false)
const title = ref('')

const submit = async () => {
  if (!title.value.trim()) return

  loading.value = true
  try {
    await $fetch('/api/posts', {
      method: 'POST',
      body: { category_id: props.categoryId, title: title.value.trim() }
    })
  } catch {
    loading.value = false
    notify.error('投稿に失敗しました')
    return
  }
  loading.value = false

  notify.success('投稿しました')
  title.value = ''
  emit('created')
}
</script>

<template>
  <UCard>
    <template #header>
      <p class="text-sm font-medium">新規投稿を作成</p>
    </template>
    <UForm :state="{ title }" @submit.prevent="submit">
      <UFormField label="タイトル" name="title">
        <UInput v-model="title" placeholder="投稿タイトルを入力..." class="w-full" />
      </UFormField>
      <div class="flex gap-2 justify-end mt-4">
        <UButton color="neutral" variant="ghost" @click="emit('cancel')">キャンセル</UButton>
        <UButton type="submit" :loading="loading" :disabled="!title.trim()">投稿する</UButton>
      </div>
    </UForm>
  </UCard>
</template>
