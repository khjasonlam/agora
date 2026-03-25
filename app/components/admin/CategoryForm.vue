<script setup lang="ts">
import type { Category } from '~/types'

const props = defineProps<{
  open: boolean
  category?: Category | null
}>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

const notify = useNotificationStore()
const loading = ref(false)
const form = reactive({
  name: '',
  icon: 'i-heroicons-folder'
})

const isEdit = computed(() => !!props.category)
const modalTitle = computed(() => isEdit.value ? 'カテゴリ編集' : 'カテゴリ作成')

watch(() => props.open, (val) => {
  if (val && props.category) {
    form.name = props.category.name
    form.icon = props.category.icon
  } else if (val) {
    form.name = ''
    form.icon = 'i-heroicons-folder'
  }
})

const submit = async () => {
  if (!form.name.trim()) return

  loading.value = true
  try {
    if (isEdit.value && props.category) {
      await $fetch(`/api/categories/${props.category.id}`, {
        method: 'PUT',
        body: { name: form.name.trim(), icon: form.icon.trim() }
      })
    } else {
      await $fetch('/api/categories', {
        method: 'POST',
        body: { name: form.name.trim(), icon: form.icon.trim() }
      })
    }
  } catch {
    loading.value = false
    notify.error(isEdit.value ? 'カテゴリの更新に失敗しました' : 'カテゴリの作成に失敗しました')
    return
  }
  loading.value = false

  notify.success(isEdit.value ? 'カテゴリを更新しました' : 'カテゴリを作成しました')
  emit('update:open', false)
  emit('saved')
}
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-semibold text-lg">{{ modalTitle }}</h3>
        </template>
        <UForm :state="form" class="space-y-4" @submit.prevent="submit">
          <UFormField label="カテゴリ名" name="name">
            <UInput v-model="form.name" placeholder="カテゴリ名を入力..." class="w-full" />
          </UFormField>
          <UFormField label="アイコン" name="icon">
            <UInput v-model="form.icon" placeholder="i-heroicons-folder" class="w-full" />
            <template #hint>
              <div class="flex items-center gap-1">
                <span class="text-xs text-muted">プレビュー:</span>
                <UIcon :name="form.icon || 'i-heroicons-folder'" class="size-4 text-primary" />
              </div>
            </template>
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="emit('update:open', false)">キャンセル</UButton>
            <UButton type="submit" :loading="loading">{{ isEdit ? '更新する' : '作成する' }}</UButton>
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>
</template>
