<script setup lang="ts">
const user = useSupabaseUser()
const authStore = useAuthStore()

watch(() => user.value?.id, async (id) => {
  if (id) {
    await authStore.fetchProfile()
  } else {
    authStore.clearProfile()
  }
}, { immediate: true })
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
