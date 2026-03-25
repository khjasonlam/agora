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
  <div class="min-h-screen flex items-center justify-center">
    <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-primary" />
  </div>
</template>
