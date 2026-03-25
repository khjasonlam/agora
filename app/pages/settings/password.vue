<script setup lang="ts">
const supabase = useSupabaseClient()
const notify = useNotificationStore()
const loading = ref(false)
const form = reactive({ password: '', confirm: '' })

const submit = async () => {
  if (form.password !== form.confirm) {
    notify.error('パスワードが一致しません')
    return
  }

  loading.value = true
  const { error } = await supabase.auth.updateUser({ password: form.password })
  loading.value = false

  if (error) {
    notify.error('パスワードの変更に失敗しました')
    return
  }

  notify.success('パスワードを変更しました')
  form.password = ''
  form.confirm = ''
}
</script>

<template>
  <div class="p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-6">パスワード変更</h1>
    <UCard>
      <UForm :state="form" class="space-y-4" @submit.prevent="submit">
        <UFormField label="新しいパスワード" name="password">
          <UInput v-model="form.password" type="password" class="w-full" />
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
