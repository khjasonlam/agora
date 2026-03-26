import { badRequest } from './apiErrors'

export const parseRouteId = (rawId: string | undefined, label = 'id') => {
  if (!rawId) {
    throw badRequest(`${label} is required`)
  }

  const parsed = Number(rawId)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw badRequest(`${label} must be a positive integer`)
  }

  return parsed
}

export const parseRequiredPositiveInt = (value: unknown, label: string) => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw badRequest(`${label} must be a positive integer`)
  }

  return parsed
}

export const parseRequiredParam = (rawValue: string | undefined, label: string) => {
  if (!rawValue) {
    throw badRequest(`${label} is required`)
  }

  return rawValue
}
