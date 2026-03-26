<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const signOut = async () => {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex h-screen">
    <aside class="hidden lg:flex flex-col w-64 border-r border-default shrink-0">
      <div class="h-14 flex items-center px-5 border-b border-default">
        <NuxtLink to="/" class="text-xl font-bold tracking-tight text-primary">agora</NuxtLink>
      </div>
      <nav class="flex-1 overflow-y-auto p-3">
        <LayoutAppSidebar />
      </nav>
      <div class="border-t border-default p-3 space-y-2">
        <ClientOnly>
          <div class="flex items-center gap-2.5 px-2 py-1.5">
            <div class="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
              {{ authStore.profile?.name?.charAt(0) ?? '?' }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium truncate">{{ authStore.profile?.name ?? 'ユーザー' }}</p>
              <p class="text-xs text-muted truncate">{{ user?.email }}</p>
            </div>
          </div>
          <template #fallback>
            <div class="flex items-center gap-2.5 px-2 py-1.5">
              <div class="size-8 rounded-full bg-primary/10 animate-pulse shrink-0" />
              <div class="min-w-0 flex-1 space-y-1.5">
                <div class="h-4 w-20 rounded bg-muted/20 animate-pulse" />
                <div class="h-3 w-32 rounded bg-muted/20 animate-pulse" />
              </div>
            </div>
          </template>
        </ClientOnly>
        <div class="flex items-center gap-2">
          <UButton
            to="/settings/password"
            class="flex-1"
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-cog-6-tooth"
          >
            設定
          </UButton>
          <UColorModeButton size="xs" variant="ghost" color="neutral" />
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-arrow-right-on-rectangle"
            @click="signOut"
          >
            ログアウト
          </UButton>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="lg:hidden flex items-center justify-between px-4 h-14 border-b border-default">
        <div class="flex items-center gap-2">
          <UButton
            icon="i-heroicons-bars-3"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="mobileMenuOpen = true"
          />
          <NuxtLink to="/" class="text-lg font-bold tracking-tight text-primary">agora</NuxtLink>
        </div>
        <UColorModeButton size="sm" variant="ghost" color="neutral" />
      </header>
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>

    <USlideover v-model:open="mobileMenuOpen" side="left" title="メニュー" description="ナビゲーション" class="lg:hidden">
      <template #content>
        <div class="flex flex-col h-full">
          <div class="h-14 flex items-center justify-between px-4 border-b border-default">
            <NuxtLink to="/" class="text-xl font-bold tracking-tight text-primary" @click="mobileMenuOpen = false">
              agora
            </NuxtLink>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="mobileMenuOpen = false"
            />
          </div>
          <nav class="flex-1 overflow-y-auto p-3" @click="mobileMenuOpen = false">
            <LayoutAppSidebar />
          </nav>
          <div class="border-t border-default p-3 space-y-2">
            <ClientOnly>
              <div class="flex items-center gap-2.5 px-2 py-1.5">
                <div class="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                  {{ authStore.profile?.name?.charAt(0) ?? '?' }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate">{{ authStore.profile?.name ?? 'ユーザー' }}</p>
                  <p class="text-xs text-muted truncate">{{ user?.email }}</p>
                </div>
              </div>
              <template #fallback>
                <div class="flex items-center gap-2.5 px-2 py-1.5">
                  <div class="size-8 rounded-full bg-primary/10 animate-pulse shrink-0" />
                  <div class="min-w-0 flex-1 space-y-1.5">
                    <div class="h-4 w-20 rounded bg-muted/20 animate-pulse" />
                    <div class="h-3 w-32 rounded bg-muted/20 animate-pulse" />
                  </div>
                </div>
              </template>
            </ClientOnly>
            <div class="flex items-center gap-2">
              <UButton
                to="/settings/password"
                class="flex-1"
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-heroicons-cog-6-tooth"
                @click="mobileMenuOpen = false"
              >
                設定
              </UButton>
              <UColorModeButton size="xs" variant="ghost" color="neutral" />
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-heroicons-arrow-right-on-rectangle"
                @click="signOut"
              >
                ログアウト
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
