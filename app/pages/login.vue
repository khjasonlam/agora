<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const supabase = useSupabaseClient()
const notify = useNotificationStore()
const loading = ref(false)

const form = reactive({ email: '', password: '' })

const signIn = async () => {
  loading.value = true
  const { error, data } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password
  })
  loading.value = false

  if (error || !data.user) {
    notify.error('メールアドレスまたはパスワードが正しくありません')
    return
  }

  reloadNuxtApp({ path: '/' })
}

const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${useRequestURL().origin}/auth/callback` }
  })
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="font-semibold text-center">ログイン</h2>
    </template>
    <UForm :state="form" class="space-y-4" @submit.prevent="signIn">
      <UFormField label="メールアドレス" name="email">
        <UInput v-model="form.email" type="email" placeholder="your@email.com" class="w-full" />
      </UFormField>
      <UFormField label="パスワード" name="password">
        <UInput v-model="form.password" type="password" placeholder="パスワード" class="w-full" />
      </UFormField>
      <UButton type="submit" class="w-full" :loading="loading">
        ログイン
      </UButton>
    </UForm>

    <USeparator label="または" class="my-5" />

    <UButton
      color="neutral"
      variant="outline"
      class="w-full"
      icon="i-simple-icons-google"
      @click="signInWithGoogle"
    >
      Google でログイン
    </UButton>

    <template #footer>
      <div class="text-center">
        <NuxtLink to="/recover" class="text-sm text-primary hover:underline">
          パスワードをお忘れの方
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>
