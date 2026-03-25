<script setup lang="ts">
const user = useSupabaseUser()
const authStore = useAuthStore()

watch(() => user.value?.sub, async (sub) => {
  if (sub) {
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
