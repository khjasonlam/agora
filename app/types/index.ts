export interface Profile {
  id: string
  employee_id: string
  name: string
  is_admin: boolean
  created_at: string
}

export interface Category {
  id: number
  name: string
  icon: string
  is_deleted: boolean
  created_at: string
}

export interface Post {
  id: number
  user_id: string
  category_id: number
  title: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  profiles: Pick<Profile, 'name'> | null
  categories: Pick<Category, 'name' | 'icon'> | null
  threads: { count: number }[]
}

export interface Thread {
  id: number
  user_id: string
  post_id: number
  thread_number: number
  content: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  profiles: Pick<Profile, 'name'> | null
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}
