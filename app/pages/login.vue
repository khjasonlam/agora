<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const supabase = useSupabaseClient()
const notify = useNotificationStore()
const loading = ref(false)

const form = reactive({ email: '', password: '' })

async function signIn() {
  loading.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password
  })
  loading.value = false

  if (error) {
    notify.error('メールアドレスまたはパスワードが正しくありません')
    return
  }

  await navigateTo('/')
}

async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${useRequestURL().origin}/auth/callback` }
  })
}
</script>

<template>
  <UCard>
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

    <USeparator label="または" class="my-4" />

    <UButton color="neutral" variant="outline" class="w-full" icon="i-simple-icons-google" @click="signInWithGoogle">
      Google でログイン
    </UButton>

    <div class="text-center mt-4">
      <NuxtLink to="/recover" class="text-sm text-primary hover:underline">
        パスワードをお忘れの方
      </NuxtLink>
    </div>
  </UCard>
</template>
