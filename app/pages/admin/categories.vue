<script setup lang="ts">
import type { Category, ApiResponse } from '~/types'

definePageMeta({ middleware: 'admin' })

const notify = useNotificationStore()

const { data: categoriesData, status, error, refresh } = await useFetch<ApiResponse<Category[]>>('/api/categories')
const categories = computed(() => categoriesData.value?.data ?? [])

const search = ref('')
const page = ref(1)
const PAGE_SIZE = 10

watch(search, () => {
  page.value = 1
})

const filtered = computed(() =>
  categories.value.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

const formOpen = ref(false)
const editTarget = ref<Category | null>(null)

const openCreateForm = () => {
  editTarget.value = null
  formOpen.value = true
}

const openEditForm = (cat: Category) => {
  editTarget.value = cat
  formOpen.value = true
}

const deleteTarget = ref<Category | null>(null)
const deleteModalOpen = ref(false)
const deleteLoading = ref(false)

const openDeleteModal = (cat: Category) => {
  deleteTarget.value = cat
  deleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return

  deleteLoading.value = true
  try {
    await $fetch(`/api/categories/${deleteTarget.value.id}`, { method: 'DELETE' })
  } catch {
    deleteLoading.value = false
    notify.error('カテゴリの削除に失敗しました')
    return
  }
  deleteLoading.value = false
  deleteModalOpen.value = false

  notify.success('カテゴリを削除しました')
  await refresh()
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <UBreadcrumb
      :items="[
        { label: '管理ダッシュボード', to: '/admin', icon: 'i-heroicons-shield-check' },
        { label: 'カテゴリ管理' }
      ]"
      class="mb-4"
    />

    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">カテゴリ管理</h1>
      <UButton icon="i-heroicons-plus" @click="openCreateForm">
        新規カテゴリ
      </UButton>
    </div>

    <SharedLoadingSpinner v-if="status === 'pending'" text="カテゴリを読み込み中..." />
    <SharedErrorState v-else-if="error" message="カテゴリ一覧の取得に失敗しました。" @retry="refresh()" />
    <template v-else>
      <div class="mb-4">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="カテゴリ名で検索..."
          class="max-w-xs"
        />
      </div>

      <UCard>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-default">
                <th class="text-left py-3 px-4 font-medium text-muted">アイコン</th>
                <th class="text-left py-3 px-4 font-medium text-muted">カテゴリ名</th>
                <th class="text-left py-3 px-4 font-medium text-muted">作成日</th>
                <th class="text-right py-3 px-4 font-medium text-muted">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="cat in paginated"
                :key="cat.id"
                class="border-b border-default last:border-b-0 hover:bg-elevated/50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                    <UIcon :name="cat.icon" class="size-4 text-primary" />
                  </div>
                </td>
                <td class="py-3 px-4 font-medium">{{ cat.name }}</td>
                <td class="py-3 px-4 text-muted">{{ formatRelativeDate(cat.created_at) }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center justify-end gap-2">
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-heroicons-pencil-square"
                      @click="openEditForm(cat)"
                    >
                      編集
                    </UButton>
                    <UButton
                      size="xs"
                      color="error"
                      variant="ghost"
                      icon="i-heroicons-trash"
                      @click="openDeleteModal(cat)"
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
          icon="i-heroicons-tag"
          :title="search ? '検索結果がありません' : 'カテゴリがありません'"
        />
        <div v-if="filtered.length > PAGE_SIZE" class="flex justify-center pt-4 border-t border-default">
          <UPagination v-model:page="page" :total="filtered.length" :page-count="PAGE_SIZE" />
        </div>
      </UCard>
    </template>

    <AdminCategoryForm
      v-model:open="formOpen"
      :category="editTarget"
      @saved="refresh()"
    />

    <AdminDeleteModal
      v-model:open="deleteModalOpen"
      :loading="deleteLoading"
      title="カテゴリの削除"
      :description="`「${deleteTarget?.name ?? ''}」を削除しますか？カテゴリ内の投稿は引き続き閲覧可能です。`"
      @confirm="confirmDelete"
    />
  </div>
</template>
