import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1).max(150),
  icon: z.string().min(1).default('i-heroicons-folder')
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(150).optional(),
  icon: z.string().min(1).optional()
})

export const createPostSchema = z.object({
  category_id: z.number().int().positive(),
  title: z.string().min(1).max(255)
})

export const createThreadSchema = z.object({
  post_id: z.number().int().positive(),
  content: z.string().min(1)
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
})

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(20),
  employeeId: z.string().min(1),
  isAdmin: z.boolean().default(false)
})

export const updateUserSchema = z.object({
  name: z.string().min(1).max(20),
  employeeId: z.string().min(1),
  isAdmin: z.boolean()
})
