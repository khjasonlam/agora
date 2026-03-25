<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="hidden lg:flex flex-col w-64 border-r border-default shrink-0">
      <div class="p-4 border-b border-default">
        <NuxtLink to="/" class="text-xl font-bold text-primary">agora</NuxtLink>
      </div>
      <nav class="flex-1 overflow-y-auto p-2">
        <LayoutAppSidebar />
      </nav>
      <div class="p-4 border-t border-default">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-user-circle" class="size-5 text-muted" />
          <span class="text-sm text-muted truncate">{{ user?.email }}</span>
        </div>
        <UButton
          class="w-full mt-2"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-arrow-right-on-rectangle"
          @click="signOut"
        >
          ログアウト
        </UButton>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="lg:hidden flex items-center justify-between px-4 h-14 border-b border-default">
        <NuxtLink to="/" class="text-lg font-bold text-primary">agora</NuxtLink>
        <UColorModeButton />
      </header>
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
