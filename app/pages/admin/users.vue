<script setup lang="ts">
import type { Profile, ApiResponse } from '~/types'

definePageMeta({ middleware: 'admin' })

const notify = useNotificationStore()
const { data: usersData, refresh } = await useFetch<ApiResponse<Profile[]>>('/api/admin/users')
const users = computed(() => usersData.value?.data ?? [])

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
    <div class="flex items-center gap-2 mb-6">
      <NuxtLink to="/admin" class="text-sm text-muted hover:underline flex items-center gap-1">
        <UIcon name="i-heroicons-arrow-left" class="size-4" />
        管理ダッシュボード
      </NuxtLink>
    </div>

    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">ユーザー管理</h1>
      <UButton icon="i-heroicons-plus" @click="openCreateForm">
        新規ユーザー
      </UButton>
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
            <tr v-for="u in users" :key="u.id" class="border-b border-default last:border-b-0">
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-user-circle" class="size-5 text-muted" />
                  {{ u.name }}
                </div>
              </td>
              <td class="py-3 px-4 text-muted">{{ u.employee_id }}</td>
              <td class="py-3 px-4">
                <UBadge :color="u.is_admin ? 'error' : 'neutral'" variant="subtle" size="sm">
                  {{ u.is_admin ? '管理者' : 'ユーザー' }}
                </UBadge>
              </td>
              <td class="py-3 px-4 text-muted">{{ formatRelativeDate(u.created_at) }}</td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
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
      <p v-if="users.length === 0" class="text-center text-muted py-8">
        ユーザーが見つかりません
      </p>
    </UCard>

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
