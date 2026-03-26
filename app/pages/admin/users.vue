<script setup lang="ts">
import type { Profile, ApiResponse } from '~/types'

definePageMeta({ middleware: 'admin' })

const notify = useNotificationStore()
const { data: usersData, status, error, refresh } = await useFetch<ApiResponse<Profile[]>>('/api/admin/users')
const users = computed(() => usersData.value?.data ?? [])

const search = ref('')
const page = ref(1)
const PAGE_SIZE = 10

watch(search, () => {
  page.value = 1
})

const filtered = computed(() =>
  users.value.filter(u =>
    u.name.toLowerCase().includes(search.value.toLowerCase())
    || u.employee_id.toLowerCase().includes(search.value.toLowerCase())
  )
)

const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

const formOpen = ref(false)
const editTarget = ref<Profile | null>(null)

const openCreateForm = () => {
  editTarget.value = null
  formOpen.value = true
}

const openEditForm = (user: Profile) => {
  editTarget.value = user
  formOpen.value = true
}

const deleteTarget = ref<Profile | null>(null)
const deleteModalOpen = ref(false)
const deleteLoading = ref(false)

const openDeleteModal = (user: Profile) => {
  deleteTarget.value = user
  deleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return

  deleteLoading.value = true
  try {
    await $fetch(`/api/admin/users/${deleteTarget.value.id}`, { method: 'DELETE' })
  } catch {
    deleteLoading.value = false
    notify.error('ユーザーの削除に失敗しました')
    return
  }
  deleteLoading.value = false
  deleteModalOpen.value = false

  notify.success('ユーザーを削除しました')
  await refresh()
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <UBreadcrumb
      :items="[
        { label: '管理ダッシュボード', to: '/admin', icon: 'i-heroicons-shield-check' },
        { label: 'ユーザー管理' }
      ]"
      class="mb-4"
    />

    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">ユーザー管理</h1>
      <UButton icon="i-heroicons-plus" @click="openCreateForm">
        新規ユーザー
      </UButton>
    </div>

    <SharedLoadingSpinner v-if="status === 'pending'" text="ユーザーを読み込み中..." />
    <SharedErrorState v-else-if="error" message="ユーザー一覧の取得に失敗しました。" @retry="refresh()" />
    <template v-else>
      <div class="mb-4">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="名前・社員IDで検索..."
          class="max-w-xs"
        />
      </div>

      <UCard>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-default">
                <th class="text-left py-3 px-4 font-medium text-muted">名前</th>
                <th class="text-left py-3 px-4 font-medium text-muted">社員ID</th>
                <th class="text-left py-3 px-4 font-medium text-muted">権限</th>
                <th class="text-left py-3 px-4 font-medium text-muted">登録日</th>
                <th class="text-right py-3 px-4 font-medium text-muted">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="u in paginated"
                :key="u.id"
                class="border-b border-default last:border-b-0 hover:bg-elevated/50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="flex items-center justify-center size-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {{ u.name.charAt(0) }}
                    </div>
                    <span class="font-medium">{{ u.name }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-muted font-mono text-xs">{{ u.employee_id }}</td>
                <td class="py-3 px-4">
                  <UBadge :color="u.is_admin ? 'error' : 'neutral'" variant="subtle" size="sm">
                    {{ u.is_admin ? '管理者' : 'ユーザー' }}
                  </UBadge>
                </td>
                <td class="py-3 px-4 text-muted">{{ formatRelativeDate(u.created_at) }}</td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-heroicons-pencil-square"
                      @click="openEditForm(u)"
                    >
                      編集
                    </UButton>
                    <UButton
                      v-if="!u.is_admin"
                      size="xs"
                      color="error"
                      variant="ghost"
                      icon="i-heroicons-trash"
                      @click="openDeleteModal(u)"
                    >
                      削除
                    </UButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <SharedEmptyState
          v-if="filtered.length === 0"
          icon="i-heroicons-users"
          :title="search ? '検索結果がありません' : 'ユーザーが見つかりません'"
        />
        <div v-if="filtered.length > PAGE_SIZE" class="flex justify-center pt-4 border-t border-default">
          <UPagination v-model:page="page" :total="filtered.length" :page-count="PAGE_SIZE" />
        </div>
      </UCard>
    </template>

    <AdminUserForm
      v-model:open="formOpen"
      :user="editTarget"
      @saved="refresh()"
    />

    <AdminDeleteModal
      v-model:open="deleteModalOpen"
      :loading="deleteLoading"
      title="ユーザーの削除"
      :description="`${deleteTarget?.name ?? ''} を削除しますか？この操作は取り消せません。`"
      @confirm="confirmDelete"
    />
  </div>
</template>
