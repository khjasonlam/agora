<script setup lang="ts">
const notify = useNotificationStore()
const loading = ref(false)
const form = reactive({ currentPassword: '', newPassword: '', confirm: '' })

const submit = async () => {
  if (form.newPassword !== form.confirm) {
    notify.error('パスワードが一致しません')
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/change-password', {
      method: 'PUT',
      body: {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      }
    })
  } catch (err: unknown) {
    loading.value = false
    const message = err instanceof Error ? err.message : 'パスワードの変更に失敗しました'
    const statusMessage = (err as { data?: { message?: string } })?.data?.message
    notify.error(statusMessage ?? message)
    return
  }
  loading.value = false

  notify.success('パスワードを変更しました')
  form.currentPassword = ''
  form.newPassword = ''
  form.confirm = ''
}
</script>

<template>
  <div class="p-6 max-w-md mx-auto">
    <NuxtLink to="/" class="text-sm text-muted hover:underline inline-flex items-center gap-1 mb-4">
      <UIcon name="i-heroicons-arrow-left" class="size-3.5" />
      ホーム
    </NuxtLink>

    <h1 class="text-2xl font-bold mb-6">パスワード変更</h1>

    <UCard>
      <UForm :state="form" class="space-y-4" @submit.prevent="submit">
        <UFormField label="現在のパスワード" name="currentPassword">
          <UInput v-model="form.currentPassword" type="password" class="w-full" />
        </UFormField>
        <UFormField label="新しいパスワード" name="newPassword">
          <UInput v-model="form.newPassword" type="password" class="w-full" />
        </UFormField>
        <UFormField label="パスワード確認" name="confirm">
          <UInput v-model="form.confirm" type="password" class="w-full" />
        </UFormField>
        <UButton type="submit" :loading="loading" class="w-full">
          変更する
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
