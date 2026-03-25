<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const supabase = useSupabaseClient()
const notify = useNotificationStore()
const loading = ref(false)
const sent = ref(false)
const email = ref('')

async function sendResetEmail() {
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
  <UCard>
    <template v-if="sent">
      <div class="text-center space-y-2">
        <UIcon name="i-heroicons-envelope-open" class="size-12 text-success mx-auto" />
        <p class="font-medium">メールを送信しました</p>
        <p class="text-sm text-muted">{{ email }} にパスワードリセットのリンクを送りました。</p>
        <UButton variant="ghost" to="/login">ログインに戻る</UButton>
      </div>
    </template>
    <template v-else>
      <UForm :state="{ email }" class="space-y-4" @submit.prevent="sendResetEmail">
        <UFormField label="メールアドレス" name="email">
          <UInput v-model="email" type="email" placeholder="your@email.com" class="w-full" />
        </UFormField>
        <UButton type="submit" class="w-full" :loading="loading">
          リセットメールを送信
        </UButton>
      </UForm>
      <div class="text-center mt-4">
        <NuxtLink to="/login" class="text-sm text-muted hover:underline">
          ログインに戻る
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>
