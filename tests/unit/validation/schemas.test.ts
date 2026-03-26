import { describe, it, expect } from 'vitest'
import {
  changePasswordSchema,
  createCategorySchema,
  createPostSchema,
  createThreadSchema,
  createUserSchema,
  updateCategorySchema,
  updateUserSchema
} from '../../../server/validation/schemas'

// ─── Category schemas ────────────────────────────────────────────────────────

describe('createCategorySchema', () => {
  it('accepts valid input', () => {
    const result = createCategorySchema.safeParse({ name: 'Tech', icon: 'i-heroicons-folder' })
    expect(result.success).toBe(true)
  })

  it('uses default icon when not provided', () => {
    const result = createCategorySchema.safeParse({ name: 'Tech' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.icon).toBe('i-heroicons-folder')
    }
  })

  it('rejects empty name', () => {
    const result = createCategorySchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding 150 characters', () => {
    const longName = 'a'.repeat(151)
    const result = createCategorySchema.safeParse({ name: longName, icon: 'i-heroicons-folder' })
    expect(result.success).toBe(false)
  })

  it('accepts name at exactly 150 characters', () => {
    const exactName = 'a'.repeat(150)
    const result = createCategorySchema.safeParse({ name: exactName, icon: 'i-heroicons-folder' })
    expect(result.success).toBe(true)
  })

  it('rejects empty icon string', () => {
    const result = createCategorySchema.safeParse({ name: 'Tech', icon: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing name field', () => {
    const result = createCategorySchema.safeParse({ icon: 'i-heroicons-folder' })
    expect(result.success).toBe(false)
  })
})

describe('updateCategorySchema', () => {
  it('accepts partial update with name only', () => {
    const result = updateCategorySchema.safeParse({ name: 'New Name' })
    expect(result.success).toBe(true)
  })

  it('accepts partial update with icon only', () => {
    const result = updateCategorySchema.safeParse({ icon: 'i-heroicons-chat' })
    expect(result.success).toBe(true)
  })

  it('accepts both fields', () => {
    const result = updateCategorySchema.safeParse({ name: 'New Name', icon: 'i-heroicons-chat' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object (no fields required)', () => {
    const result = updateCategorySchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejects empty name string', () => {
    const result = updateCategorySchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding 150 characters', () => {
    const result = updateCategorySchema.safeParse({ name: 'a'.repeat(151) })
    expect(result.success).toBe(false)
  })
})

// ─── Post schemas ─────────────────────────────────────────────────────────────

describe('createPostSchema', () => {
  it('accepts valid input', () => {
    const result = createPostSchema.safeParse({ category_id: 1, title: 'My Post' })
    expect(result.success).toBe(true)
  })

  it('rejects missing category_id', () => {
    const result = createPostSchema.safeParse({ title: 'My Post' })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer category_id', () => {
    const result = createPostSchema.safeParse({ category_id: 1.5, title: 'My Post' })
    expect(result.success).toBe(false)
  })

  it('rejects zero category_id', () => {
    const result = createPostSchema.safeParse({ category_id: 0, title: 'My Post' })
    expect(result.success).toBe(false)
  })

  it('rejects negative category_id', () => {
    const result = createPostSchema.safeParse({ category_id: -1, title: 'My Post' })
    expect(result.success).toBe(false)
  })

  it('rejects empty title', () => {
    const result = createPostSchema.safeParse({ category_id: 1, title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects title exceeding 255 characters', () => {
    const result = createPostSchema.safeParse({ category_id: 1, title: 'a'.repeat(256) })
    expect(result.success).toBe(false)
  })

  it('accepts title at exactly 255 characters', () => {
    const result = createPostSchema.safeParse({ category_id: 1, title: 'a'.repeat(255) })
    expect(result.success).toBe(true)
  })
})

// ─── Thread schemas ───────────────────────────────────────────────────────────

describe('createThreadSchema', () => {
  it('accepts valid input', () => {
    const result = createThreadSchema.safeParse({ post_id: 1, content: 'Hello' })
    expect(result.success).toBe(true)
  })

  it('rejects missing post_id', () => {
    const result = createThreadSchema.safeParse({ content: 'Hello' })
    expect(result.success).toBe(false)
  })

  it('rejects zero post_id', () => {
    const result = createThreadSchema.safeParse({ post_id: 0, content: 'Hello' })
    expect(result.success).toBe(false)
  })

  it('rejects negative post_id', () => {
    const result = createThreadSchema.safeParse({ post_id: -5, content: 'Hello' })
    expect(result.success).toBe(false)
  })

  it('rejects empty content', () => {
    const result = createThreadSchema.safeParse({ post_id: 1, content: '' })
    expect(result.success).toBe(false)
  })

  it('accepts long content', () => {
    const result = createThreadSchema.safeParse({ post_id: 1, content: 'a'.repeat(1000) })
    expect(result.success).toBe(true)
  })

  it('rejects missing content', () => {
    const result = createThreadSchema.safeParse({ post_id: 1 })
    expect(result.success).toBe(false)
  })
})

// ─── Auth schemas ─────────────────────────────────────────────────────────────

describe('changePasswordSchema', () => {
  it('accepts valid input', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass123',
      newPassword: 'newpass123'
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty currentPassword', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'newpass123'
    })
    expect(result.success).toBe(false)
  })

  it('rejects newPassword shorter than 6 characters', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'short'
    })
    expect(result.success).toBe(false)
  })

  it('accepts newPassword at exactly 6 characters', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'abc123'
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing currentPassword', () => {
    const result = changePasswordSchema.safeParse({ newPassword: 'newpass123' })
    expect(result.success).toBe(false)
  })

  it('rejects missing newPassword', () => {
    const result = changePasswordSchema.safeParse({ currentPassword: 'oldpass' })
    expect(result.success).toBe(false)
  })
})

// ─── Admin user schemas ───────────────────────────────────────────────────────

describe('createUserSchema', () => {
  const validUser = {
    email: 'user@example.com',
    password: 'password123',
    name: 'Alice',
    employeeId: 'EMP001',
    isAdmin: false
  }

  it('accepts valid input', () => {
    const result = createUserSchema.safeParse(validUser)
    expect(result.success).toBe(true)
  })

  it('defaults isAdmin to false when not provided', () => {
    const { isAdmin: _isAdmin, ...withoutAdmin } = validUser
    const result = createUserSchema.safeParse(withoutAdmin)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isAdmin).toBe(false)
    }
  })

  it('rejects invalid email format', () => {
    const result = createUserSchema.safeParse({ ...validUser, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 6 characters', () => {
    const result = createUserSchema.safeParse({ ...validUser, password: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = createUserSchema.safeParse({ ...validUser, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding 20 characters', () => {
    const result = createUserSchema.safeParse({ ...validUser, name: 'a'.repeat(21) })
    expect(result.success).toBe(false)
  })

  it('accepts name at exactly 20 characters', () => {
    const result = createUserSchema.safeParse({ ...validUser, name: 'a'.repeat(20) })
    expect(result.success).toBe(true)
  })

  it('rejects empty employeeId', () => {
    const result = createUserSchema.safeParse({ ...validUser, employeeId: '' })
    expect(result.success).toBe(false)
  })

  it('accepts isAdmin as true', () => {
    const result = createUserSchema.safeParse({ ...validUser, isAdmin: true })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isAdmin).toBe(true)
    }
  })
})

describe('updateUserSchema', () => {
  const validUpdate = {
    name: 'Bob',
    employeeId: 'EMP002',
    isAdmin: false
  }

  it('accepts valid input', () => {
    const result = updateUserSchema.safeParse(validUpdate)
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const { name: _name, ...withoutName } = validUpdate
    const result = updateUserSchema.safeParse(withoutName)
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding 20 characters', () => {
    const result = updateUserSchema.safeParse({ ...validUpdate, name: 'a'.repeat(21) })
    expect(result.success).toBe(false)
  })

  it('rejects missing employeeId', () => {
    const result = updateUserSchema.safeParse({ name: 'Bob', isAdmin: false })
    expect(result.success).toBe(false)
  })

  it('rejects missing isAdmin', () => {
    const result = updateUserSchema.safeParse({ name: 'Bob', employeeId: 'EMP002' })
    expect(result.success).toBe(false)
  })

  it('accepts isAdmin as true', () => {
    const result = updateUserSchema.safeParse({ ...validUpdate, isAdmin: true })
    expect(result.success).toBe(true)
  })
})
