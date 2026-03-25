<script setup lang="ts">
const supabase = useSupabaseClient()
const notify = useNotificationStore()

onMounted(async () => {
  const { error } = await supabase.auth.getSession()
  if (error) {
    notify.error('認証に失敗しました')
    await navigateTo('/login')
    return
  }
  await navigateTo('/')
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-4">
    <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-primary" />
    <p class="text-sm text-muted">認証を確認中...</p>
  </div>
</template>
