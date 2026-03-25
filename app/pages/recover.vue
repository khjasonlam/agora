<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const supabase = useSupabaseClient()
const notify = useNotificationStore()
const loading = ref(false)
const sent = ref(false)
const email = ref('')

const sendResetEmail = async () => {
  loading.value = true
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${useRequestURL().origin}/settings/password`
  })
  loading.value = false

  if (error) {
    notify.error('メール送信に失敗しました')
    return
  }

  sent.value = true
}
</script>

<template>
  <UCard v-if="sent">
    <div class="text-center space-y-3 py-4">
      <div class="mx-auto rounded-full bg-primary/10 p-3 w-fit">
        <UIcon name="i-heroicons-envelope-open" class="size-8 text-primary" />
      </div>
      <p class="font-medium">メールを送信しました</p>
      <p class="text-sm text-muted">{{ email }} にパスワードリセットのリンクを送りました。</p>
      <UButton variant="ghost" to="/login" class="mt-2">ログインに戻る</UButton>
    </div>
  </UCard>

  <UCard v-else>
    <template #header>
      <h2 class="font-semibold text-center">パスワードリセット</h2>
    </template>
    <UForm :state="{ email }" class="space-y-4" @submit.prevent="sendResetEmail">
      <UFormField label="メールアドレス" name="email">
        <UInput v-model="email" type="email" placeholder="your@email.com" class="w-full" />
      </UFormField>
      <UButton type="submit" class="w-full" :loading="loading">
        リセットメールを送信
      </UButton>
    </UForm>
    <template #footer>
      <div class="text-center">
        <NuxtLink to="/login" class="text-sm text-muted hover:underline">
          ログインに戻る
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>
