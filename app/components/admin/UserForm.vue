<script setup lang="ts">
import type { Profile } from '~/types'

const props = defineProps<{
  open: boolean
  user?: Profile | null
}>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

const notify = useNotificationStore()
const loading = ref(false)
const form = reactive({
  email: '',
  password: '',
  name: '',
  employeeId: '',
  isAdmin: false
})

const isEdit = computed(() => !!props.user)
const modalTitle = computed(() => isEdit.value ? 'ユーザー編集' : 'ユーザー作成')

watch(() => props.open, (val) => {
  if (val && props.user) {
    form.email = ''
    form.password = ''
    form.name = props.user.name
    form.employeeId = props.user.employee_id
    form.isAdmin = props.user.is_admin
  } else if (val) {
    form.email = ''
    form.password = ''
    form.name = ''
    form.employeeId = ''
    form.isAdmin = false
  }
})

const submit = async () => {
  if (!form.name.trim() || !form.employeeId.trim()) return

  if (isEdit.value && props.user) {
    loading.value = true
    try {
      await $fetch(`/api/admin/users/${props.user.id}`, {
        method: 'PUT',
        body: {
          name: form.name.trim(),
          employeeId: form.employeeId.trim(),
          isAdmin: form.isAdmin
        }
      })
    } catch {
      loading.value = false
      notify.error('ユーザーの更新に失敗しました')
      return
    }
    loading.value = false
    notify.success('ユーザーを更新しました')
  } else {
    if (!form.email.trim() || !form.password) return

    loading.value = true
    try {
      await $fetch('/api/admin/users', {
        method: 'POST',
        body: {
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          employeeId: form.employeeId.trim(),
          isAdmin: form.isAdmin
        }
      })
    } catch {
      loading.value = false
      notify.error('ユーザーの作成に失敗しました')
      return
    }
    loading.value = false
    notify.success('ユーザーを作成しました')
  }

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
          <template v-if="!isEdit">
            <UFormField label="メールアドレス" name="email">
              <UInput v-model="form.email" type="email" placeholder="user@example.com" class="w-full" />
            </UFormField>
            <UFormField label="パスワード" name="password">
              <UInput v-model="form.password" type="password" placeholder="6文字以上" class="w-full" />
            </UFormField>
          </template>
          <UFormField label="名前" name="name">
            <UInput v-model="form.name" placeholder="表示名（20文字以内）" class="w-full" />
          </UFormField>
          <UFormField label="社員ID" name="employeeId">
            <UInput v-model="form.employeeId" placeholder="EMP001" class="w-full" />
          </UFormField>
          <UFormField name="isAdmin">
            <label class="flex items-center gap-2 cursor-pointer">
              <UCheckbox v-model="form.isAdmin" />
              <span class="text-sm">管理者権限を付与する</span>
            </label>
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
