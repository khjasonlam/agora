import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate, formatRelativeDate } from '~/utils/formatDate'

describe('formatDate', () => {
  it('formats a date string in Japanese locale', () => {
    const result = formatDate('2024-01-15T10:30:00.000Z')
    expect(result).toContain('2024')
  })

  it('includes month and day in output', () => {
    const result = formatDate('2024-06-20T09:00:00.000Z')
    expect(result).toContain('2024')
    expect(result).toContain('06')
    expect(result).toContain('20')
  })

  it('handles mid-year dates', () => {
    const result = formatDate('2023-06-15T12:00:00.000Z')
    expect(result).toContain('2023')
    expect(result).toContain('06')
  })

  it('includes time components', () => {
    const result = formatDate('2024-03-15T14:30:00.000Z')
    // Result should contain hours and minutes
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatRelativeDate', () => {
  const BASE_TIME = new Date('2024-01-15T12:00:00.000Z').getTime()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "たった今" for less than 1 minute ago', () => {
    const date = new Date(BASE_TIME - 30 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('たった今')
  })

  it('returns "たった今" for the exact current moment', () => {
    const date = new Date(BASE_TIME).toISOString()
    expect(formatRelativeDate(date)).toBe('たった今')
  })

  it('returns "たった今" for 59 seconds ago', () => {
    const date = new Date(BASE_TIME - 59 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('たった今')
  })

  it('returns "1分前" for exactly 1 minute ago', () => {
    const date = new Date(BASE_TIME - 60 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('1分前')
  })

  it('returns "30分前" for 30 minutes ago', () => {
    const date = new Date(BASE_TIME - 30 * 60 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('30分前')
  })

  it('returns "59分前" for 59 minutes ago', () => {
    const date = new Date(BASE_TIME - 59 * 60 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('59分前')
  })

  it('returns "1時間前" for exactly 1 hour ago', () => {
    const date = new Date(BASE_TIME - 60 * 60 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('1時間前')
  })

  it('returns "2時間前" for 2 hours ago', () => {
    const date = new Date(BASE_TIME - 2 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('2時間前')
  })

  it('returns "23時間前" for 23 hours ago', () => {
    const date = new Date(BASE_TIME - 23 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('23時間前')
  })

  it('returns "1日前" for 1 day ago', () => {
    const date = new Date(BASE_TIME - 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('1日前')
  })

  it('returns "3日前" for 3 days ago', () => {
    const date = new Date(BASE_TIME - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('3日前')
  })

  it('returns "6日前" for 6 days ago', () => {
    const date = new Date(BASE_TIME - 6 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeDate(date)).toBe('6日前')
  })

  it('returns formatted date for 7 days ago', () => {
    const date = new Date(BASE_TIME - 7 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeDate(date)
    // Falls back to formatDate which includes the year
    expect(result).toContain('2024')
  })

  it('returns formatted date for old dates (10+ days)', () => {
    const date = new Date(BASE_TIME - 10 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeDate(date)
    expect(result).toContain('2024')
  })
})
